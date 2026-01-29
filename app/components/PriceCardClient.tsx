"use client";

import { useEffect, useState } from "react";

type PriceResponse = {
  symbol: string;
  price: number | string;
  updatedAtUTC: string;
};

export default function PriceCardClient() {
  const [data, setData] = useState<PriceResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const r = await fetch("/api/price", { cache: "no-store" });
        const j = (await r.json()) as PriceResponse;
        if (!cancelled) setData(j);
      } catch {}
    }

    run();
    const t = setInterval(run, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const priceNum = data ? Number(data.price) : NaN;
  const priceText = data
    ? Number.isFinite(priceNum)
      ? priceNum.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : String(data.price)
    : "—";

  const updatedText = data
    ? `${new Date(data.updatedAtUTC)
        .toISOString()
        .replace("T", " ")
        .slice(0, 16)} UTC`
    : "—";

  return (
    <div style={styles.card}>
      <div style={styles.title}>BTC</div>
      <div style={styles.price}>{priceText}</div>
      <div style={styles.updated}>{updatedText}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    padding: "10px 14px",
    minWidth: 220,
    textAlign: "right",
  },
  title: {
    fontSize: 12,
    opacity: 0.75,
    fontWeight: 800,
  },
  price: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: 0.2,
  },
  updated: {
    fontSize: 11,
    opacity: 0.65,
    marginTop: 2,
  },
};
