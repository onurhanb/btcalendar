import CalendarClient from "./components/CalendarClient";
import PriceCardClient from "./components/PriceCardClient";

export default function Page() {
  return (
    <main style={styles.page}>
      <header style={styles.topBar}>
        <div style={styles.brandRow}>
          <div style={styles.brandIcon}>₿</div>
          <div style={styles.brandText}>
            <div style={styles.brandName}>btcalendar</div>
            <div style={styles.brandMeta}>Binance BTC/USDT (UTC 00:00–23:59)</div>
          </div>
        </div>

        <div style={styles.rightSide}>
          <div style={styles.priceBar}>
            <div style={styles.priceTitle}>BTC</div>
            <div style={styles.priceValue}>
              <PriceCardClient variant="inlinePrice" />
            </div>
            <div style={styles.priceUpdated}>
              <PriceCardClient variant="inlineUpdated" />
            </div>
          </div>
        </div>
      </header>

      <CalendarClient />

      <footer style={styles.footer}>
        Prices are derived from Binance BTCUSDT daily candles (UTC 00:00–23:59). Open and Close correspond to the candle’s open and close.
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "16px 18px",
    background:
      "radial-gradient(1200px 600px at 30% 0%, #1a2230 0%, #0b0f16 55%, #06080c 100%)",
    color: "#e7edf5",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },

  // NEW compact header
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 10,
  },

  brandRow: { display: "flex", gap: 12, alignItems: "center" },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#f59e0b",
    color: "#111827",
    fontWeight: 900,
    fontSize: 18,
    flex: "0 0 auto",
  },
  brandText: { display: "flex", flexDirection: "column", gap: 2 },
  brandName: { fontSize: 18, fontWeight: 900, letterSpacing: 0.2, lineHeight: 1.1 },
  brandMeta: { opacity: 0.75, fontSize: 12, lineHeight: 1.1 },

  rightSide: { display: "flex", alignItems: "center", gap: 10 },

  // NEW compact horizontal price bar (short height)
  priceBar: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    borderRadius: 14,
    padding: "10px 12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.30)",
    whiteSpace: "nowrap",
  },
  priceTitle: {
    fontWeight: 900,
    letterSpacing: 0.6,
    opacity: 0.85,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 950,
    letterSpacing: 0.2,
  },
  priceUpdated: {
    opacity: 0.75,
    fontSize: 12,
    marginLeft: 6,
  },

  footer: {
    opacity: 0.6,
    fontSize: 12,
    marginTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    paddingTop: 12,
  },
};
