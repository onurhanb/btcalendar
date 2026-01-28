import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const BINANCE_BASE = "https://api.binance.com";
const SYMBOL = "BTCUSDT";
const INTERVAL = "1d";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const pool = new Pool({
  connectionString: mustEnv("DATABASE_URL"),
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  // --- Security: secret check ---
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== mustEnv("CRON_SECRET")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // --- Calculate "yesterday" in UTC ---
  const now = new Date();
  const endUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(), // today 00:00 UTC
    0,
    0,
    0,
    0
  );
  const startUTC = endUTC - 24 * 60 * 60 * 1000;

  // --- Fetch Binance daily kline ---
  const url = new URL(`${BINANCE_BASE}/api/v3/klines`);
  url.searchParams.set("symbol", SYMBOL);
  url.searchParams.set("interval", INTERVAL);
  url.searchParams.set("startTime", String(startUTC));
  url.searchParams.set("endTime", String(endUTC));
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString());
  if (!res.ok) {
    return NextResponse.json({ error: "binance error" }, { status: 500 });
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    return NextResponse.json({ message: "no candle yet" });
  }

  const k = data[0];
  const open = Number(k[1]);
  const close = Number(k[4]);
  const absChange = close - open;
  const pctChange = open === 0 ? 0 : (absChange / open) * 100;

  const dateUTC = new Date(startUTC).toISOString().slice(0, 10);

  // --- Upsert into DB ---
  await pool.query(
    `
    INSERT INTO daily_candles
      (date_utc, open, close, abs_change, pct_change)
    VALUES
      ($1, $2, $3, $4, $5)
    ON CONFLICT (date_utc)
    DO UPDATE SET
      open = EXCLUDED.open,
      close = EXCLUDED.close,
      abs_change = EXCLUDED.abs_change,
      pct_change = EXCLUDED.pct_change
    `,
    [dateUTC, open, close, absChange, pctChange]
  );

  return NextResponse.json({
    status: "ok",
    date: dateUTC,
    open,
    close,
    pctChange: pctChange.toFixed(4),
  });
}
