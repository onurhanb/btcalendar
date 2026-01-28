import { NextResponse } from "next/server";

const BINANCE_BASES = [
  "https://api.binance.com",
  "https://data-api.binance.vision",
  "https://data.binance.vision",
];

async function fetchPrice() {
  let lastErr: any = null;

  for (const base of BINANCE_BASES) {
    const url = new URL(`${base}/api/v3/ticker/price`);
    url.searchParams.set("symbol", "BTCUSDT");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "btcalendar/1.0 (+price)",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const j = await res.json();
      return { ok: true as const, base, data: j };
    }

    const text = await res.text().catch(() => "");
    lastErr = { base, status: res.status, body: text.slice(0, 300) };
  }

  return { ok: false as const, error: lastErr };
}

export async function GET() {
  const r = await fetchPrice();

  if (!r.ok) {
    return NextResponse.json(
      { error: "price fetch failed", details: r.error },
      { status: 500 }
    );
  }

  const price = Number(r.data?.price);
  const body = {
    symbol: "BTCUSDT",
    price: Number.isFinite(price) ? price : r.data?.price,
    updatedAtUTC: new Date().toISOString(),
    source: r.base,
  };

  const res = NextResponse.json(body);
  // CDN cache (kısa): 30sn
  res.headers.set("Cache-Control", "public, s-maxage=30, max-age=0, stale-while-revalidate=60");
  return res;
}
