"use client";

import React, { useEffect, useState } from "react";

type PriceResp = {
  symbol: string;
  price: number;
  updatedAtUTC: string;
  source: string;
};

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function PriceCardClient(props: { variant?: "card" | "inlinePrice" | "inlineUpdated" } = {}) {
  const variant = props.variant ?? "card";

  const [p, setP] = useState<PriceResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setErr(null);
        const r = await fetch("/api/price", { cache: "no-store" });
        const j = (await r.json()) as PriceResp | { error?: string };
        if (cancelled) return;

        if (!r.ok || (j as any).error) {
          setErr((j as any).error || "price error");
          setP(null);
          return;
        }
        setP(j as PriceResp);
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "price error");
          setP(null);
        }
      }
    }

    load();
    const t = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const priceText = p ? fmt(p.price) : "—";
  const updatedText = p
    ? new Date(p.updatedAtUTC).toISOString().slice(0, 16).replace("T", " ") + " UTC"
    : "—";

  if (variant === "inlinePrice") {
    return <span>{priceText}</span>;
  }

  if (variant === "inlineUpdated") {
    return (
      <span>
        {updatedText}
        {err ? <span style={{ color: "#fca5a5" }}> · {err}</span> : null}
      </span>
    );
  }

  // default card (kept for safety)
  return (
    <div style={styles.priceCard}>
      <div style={styles.priceCardTitle}>Bitcoin Current Price</div>
      <div style={styles.priceValue}>{priceText}</div>
      <div style={styles.priceUpdated}>
        Updated: {updatedText}
        {err ? <span style={styles.err}> · {err}</span> : null}
      </div>
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
  err: { color: "#fca5a5", opacity: 1 },
};
