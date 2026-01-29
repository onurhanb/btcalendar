"use client";

import { useEffect, useState } from "react";

type PriceResp = {
  symbol: string;
  price: number;
  updatedAtUTC: string;
  source: string;
};

type Variant = "card" | "inlinePrice" | "inlineUpdated";

type Props = {
  variant?: Variant;
};

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function PriceCardClient({ variant = "card" }: Props) {
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

  /* -------- INLINE VARIANTS -------- */

  if (variant === "inlinePrice") {
    return <>{p ? fmt(p.price) : "—"}</>;
  }

  if (variant === "inlineUpdated") {
    return (
      <>
        {p
          ? new Date(p.updatedAtUTC)
              .toISOString()
              .slice(0, 16)
              .replace("T", " ") + " UTC"
          : "—"}
        {err ? <span style={styles.err}> · {err}</span> : null}
      </>
    );
  }

  /* -------- DEFAULT CARD -------- */

  return (
    <div style={styles.priceCard}>
      <div style={styles.priceCardTitle}>Bitcoin Current Price</div>
      <div style={styles.priceValue}>{p ? fmt(p.price) : "—"}</div>
      <div style={styles.priceUpdated}>
        Updated:{" "}
        {p
          ? new Date(p.updatedAtUTC)
              .toISOString()
              .slice(0, 16)
              .replace("T", " ") + " UTC"
          : "—"}
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
  priceCardTitle: { fontWeight: 700, opacity: 0.9, marginBottom: 6 },
  priceValue: { fontSize: 32, fontWeight: 900 },
  priceUpdated: { opacity: 0.75, marginTop: 4, fontSize: 12 },
  err: { color: "#fca5a5", opacity: 1 },
};
