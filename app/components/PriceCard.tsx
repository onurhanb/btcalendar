"use client";

import { useEffect, useState } from "react";

type PriceResponse = {
  symbol: string;
  price: number | string;
  updatedAtUTC: string;
  source?: string;
};

export default function PriceCard() {
  const [data, setData] = useState<PriceResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const r = await fetch("/api/price", { cache: "no-store" });
        const j = (await r.json()) as PriceResponse;
        if (!cancelled) setData(j);
      } catch {
        // ignore
      }
    }

    run();
    const t = setInterval(run, 30_000); // 30 sn
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const priceNum = data ? Number(data.price) : NaN;
  const priceText = data
    ? (Number.isFinite(priceNum) ? priceNum.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(data.price))
    : "—";

  const updatedText = data
    ? `Updated: ${new Date(data.updatedAtUTC).toISOString().replace("T", " ").slice(0, 16)} UTC`
    : "Updated: —";

  return (
    <div style={styles.priceCard}>
      <div style={styles.priceCardTitle}>Bitcoin Current Price</div>
      <div style={styles.priceValue}>{priceText}</div>
      <div style={styles.priceUpdated}>{updatedText}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  priceCard: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    borderRadius: 14,
    padding: 16,
    minWidth: 320,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  priceCardTitle: { fontWeight: 700, opacity: 0.9, marginBottom: 10 },
  priceValue: { fontSize: 34, fontWeight: 900, letterSpacing: 0.2 },
  priceUpdated: { opacity: 0.75, marginTop: 6, fontSize: 12 },
};
