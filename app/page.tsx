import CalendarClient from "./components/CalendarClient";
import PriceCardClient from "./components/PriceCardClient";

export default function Page() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>₿</div>
            <div style={styles.brandText}>
              <div style={styles.brandName}>btcalendar</div>
              <div style={styles.brandMeta}>Binance BTC/USDT (UTC 00:00–23:59)</div>
            </div>
          </div>

          {/* Compact price pill (horizontal) */}
          <div style={styles.pricePill}>
            <div style={styles.priceLeft}>BTC</div>
            <div style={styles.priceMid}>
              <PriceCardClient variant="inlinePrice" />
            </div>
            <div style={styles.priceRight}>
              <PriceCardClient variant="inlineUpdated" />
            </div>
          </div>
        </header>

        <CalendarClient />

        <footer style={styles.footer}>
          Prices are derived from Binance BTCUSDT daily candles (UTC 00:00–23:59). Open and Close correspond to the candle’s open and close.
        </footer>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "18px 16px",
    background:
      "radial-gradient(1200px 600px at 30% 0%, #1a2230 0%, #0b0f16 55%, #06080c 100%)",
    color: "#e7edf5",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },

  // <<< THIS IS THE KEY: everything centered
  container: {
    width: "100%",
    maxWidth: 1280,
    margin: "0 auto",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 10,
  },

  brandRow: { display: "flex", gap: 12, alignItems: "center" },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#f59e0b",
    color: "#111827",
    fontWeight: 900,
    fontSize: 20,
    flex: "0 0 auto",
  },
  brandText: { display: "flex", flexDirection: "column", gap: 4 },
  brandName: { fontSize: 20, fontWeight: 900, letterSpacing: 0.2 },
  brandMeta: { opacity: 0.75, fontSize: 13 },

  // compact horizontal price
  pricePill: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    whiteSpace: "nowrap",
  },
  priceLeft: { fontWeight: 900, opacity: 0.9 },
  priceMid: { fontSize: 20, fontWeight: 950, letterSpacing: 0.2 },
  priceRight: { opacity: 0.75, fontSize: 12 },

  footer: {
    opacity: 0.6,
    fontSize: 12,
    marginTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    paddingTop: 12,
  },
};
