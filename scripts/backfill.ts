import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool } from "pg";

const BINANCE_BASE = "https://api.binance.com";

type BinanceKline = [
  number, // open time
  string, // open
  string, // high
  string, // low
  string, // close
  string, // volume
  number, // close time
  string,
  number,
  string,
  string,
  string
];

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}. Did you create .env.local in project root?`);
  return v;
}

const pool = new Pool({
  connectionString: mustEnv("DATABASE_URL"),
  ssl: { rejectUnauthorized: false },
  max: 3,
});

function toDateUTC(ms: number): string {
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function fetchKlines(startMs: number, endMs: number): Promise<BinanceKline[]> {
  const url = new URL(`${BINANCE_BASE}/api/v3/klines`);
  url.searchParams.set("symbol", "BTCUSDT");
  url.searchParams.set("interval", "1d");
  url.searchParams.set("startTime", String(startMs));
  url.searchParams.set("endTime", String(endMs));
  url.searchParams.set("limit", "1000");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Binance klines error: ${res.status} ${await res.text()}`);
  return (await res.json()) as BinanceKline[];
}

async function upsertBatch(rows: Array<{ date: string; open: number; close: number; abs: number; pct: number }>) {
  const values: any[] = [];
  const placeholders: string[] = [];

  rows.forEach((r, i) => {
    const base = i * 5;
    placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
    values.push(r.date, r.open, r.close, r.abs, r.pct);
  });

  const sql = `
    INSERT INTO daily_candles (date_utc, open, close, abs_change, pct_change)
    VALUES ${placeholders.join(",")}
    ON CONFLICT (date_utc) DO UPDATE
    SET open = EXCLUDED.open,
        close = EXCLUDED.close,
        abs_change = EXCLUDED.abs_change,
        pct_change = EXCLUDED.pct_change,
        updated_at = NOW()
  `;

  await pool.query(sql, values);
}

async function main() {
  const startMs = Date.parse("2020-01-01T00:00:00.000Z");

  const now = new Date();
  const yesterdayEnd = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1,
    23,
    59,
    59,
    999
  );
  const endMs = yesterdayEnd;

  console.log(`Backfill range: ${new Date(startMs).toISOString()} -> ${new Date(endMs).toISOString()}`);

  let cursor = startMs;
  let total = 0;

  while (cursor <= endMs) {
    const batch = await fetchKlines(cursor, endMs);
    if (batch.length === 0) break;

    const rows = batch.map((k) => {
      const date = toDateUTC(k[0]);
      const open = Number(k[1]);
      const close = Number(k[4]);
      const abs = close - open;
      const pct = (abs / open) * 100;
      return { date, open, close, abs, pct };
    });

    await upsertBatch(rows);

    total += rows.length;
    const first = rows[0].date;
    const last = rows[rows.length - 1].date;
    console.log(`Inserted/updated: ${first} .. ${last} (total ${total})`);

    const lastOpenTime = batch[batch.length - 1][0];
    cursor = lastOpenTime + 24 * 60 * 60 * 1000;

    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`Done. Total days: ${total}`);
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  try { await pool.end(); } catch {}
  process.exit(1);
});
