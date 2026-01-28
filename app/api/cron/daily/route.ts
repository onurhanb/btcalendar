import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const SYMBOL = "BTCUSDT";
const INTERVAL = "1d";
const DAYS_TO_HEAL = 7; // son kaç günü toparlayalım?

const BINANCE_BASES = [
  "https://api.binance.com",
  "https://data-api.binance.vision",
  "https://data.binance.vision",
];

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const pool = new Pool({
  connectionString: mustEnv("DATABASE_URL"),
  ssl: { rejectUnauthorized: false },
});

function utcMidnightMs(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
}

async function fetchKlineWithFallback(startUTC: number, endUTC: number) {
  let lastErr: any = null;

  for (const base of BINANCE_BASES) {
    const url = new URL(`${base}/api/v3/klines`);
    url.searchParams.set("symbol", SYMBOL);
    url.searchParams.set("interval", INTERVAL);
    url.searchParams.set("startTime", String(startUTC));
    url.searchParams.set("endTime", String(endUTC));
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "btcalendar/1.0 (+cron)",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return { ok: true as const, base, status: res.status, data };
    }

    const text = await res.text().catch(() => "");
    lastErr = { base, status: res.status, body: text.slice(0, 500) };
  }

  return { ok: false as const, error: lastErr };
}

async function existsDate(dateUTC: string) {
  const r = await pool.query(`SELECT 1 FROM daily_candles WHERE date_utc = $1 LIMIT 1`, [dateUTC]);
  return (r.rowCount ?? 0) > 0;
}

async function upsertDay(dateUTC: string, open: number, close: number, absChange: number, pctChange: number) {
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
      pct_change = EXCLUDED.pct_change,
      updated_at = NOW()
    `,
    [dateUTC, open, close, absChange, pctChange]
  );
}

export async function GET(req: NextRequest) {
  // Secret check
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== mustEnv("CRON_SECRET")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayMidnightUTC = utcMidnightMs(now);

  // Bugün kapanmadığı için hedefimiz: [dün .. (dün - DAYS_TO_HEAL+1)]
  const inserted: Array<{ date: string; source: string; pctChange: string }> = [];
  const skipped: string[] = [];
  const failed: Array<{ date: string; details: any }> = [];

  for (let i = 1; i <= DAYS_TO_HEAL; i++) {
    const endUTC = todayMidnightUTC - (i - 1) * 24 * 60 * 60 * 1000;
    const startUTC = endUTC - 24 * 60 * 60 * 1000;
    const dateUTC = new Date(startUTC).toISOString().slice(0, 10);

    // zaten varsa geç
    if (await existsDate(dateUTC)) {
      skipped.push(dateUTC);
      continue;
    }

    const r = await fetchKlineWithFallback(startUTC, endUTC);
    if (!r.ok) {
      failed.push({ date: dateUTC, details: r.error });
      continue;
    }

    const data = r.data;
    if (!Array.isArray(data) || data.length === 0) {
      failed.push({ date: dateUTC, details: { message: "no candle data", source: r.base } });
      continue;
    }

    const k = data[0];
    const open = Number(k[1]);
    const close = Number(k[4]);
    const absChange = close - open;
    const pctChange = open === 0 ? 0 : (absChange / open) * 100;

    await upsertDay(dateUTC, open, close, absChange, pctChange);

    inserted.push({
      date: dateUTC,
      source: r.base,
      pctChange: Number.isFinite(pctChange) ? pctChange.toFixed(4) : String(pctChange),
    });

    // küçük bekleme: rate-limit riskini azaltır
    await new Promise((r) => setTimeout(r, 150));
  }

  return NextResponse.json({
    status: "ok",
    healedDays: DAYS_TO_HEAL,
    inserted,
    skippedCount: skipped.length,
    failed,
  });
}
