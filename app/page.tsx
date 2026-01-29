import CalendarClient from "./components/CalendarClient";

export default function Page() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>₿</div>
            <div style={styles.brandText}>
              <div style={styles.brandName}>btcalendar</div>
              <div style={styles.brandMeta}>
                Binance BTC/USDT (UTC 00:00–23:59)
              </div>
            </div>
          </div>

          <div style={styles.priceCard}>
            <div style={styles.priceCardTitle}>Bitcoin Current Price</div>
            <div id="btc-price" style={styles.priceValue}>—</div>
            <div id="btc-updated" style={styles.priceUpdated}>
              Updated: —
            </div>
          </div>
        </div>

        <CalendarClient />

        <footer style={styles.footer}>
          Prices are derived from Binance BTCUSDT daily candles (UTC 00:00–23:59).
          Open and Close correspond to the candle’s open and close.
        </footer>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 24,
    background:
      "radial-gradient(1200px 600px at 30% 0%, #1a2230 0%, #0b0f16 55%, #06080c 100%)",
    color: "#e7edf5",
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },

  // 🔑 ORTALAYAN CONTAINER
  container: {
    maxWidth: 1320,
    margin: "0 auto",
  },

  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
  },

  brandRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#f59e0b",
    color: "#111827",
    fontWeight: 900,
    fontSize: 20,
  },

  brandText: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  brandName: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: 0.2,
  },

  brandMeta: {
    opacity: 0.75,
    fontSize: 13,
  },

  priceCard: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    borderRadius: 14,
    padding: 16,
    minWidth: 320,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },

  priceCardTitle: {
    fontWeight: 700,
    opacity: 0.9,
    marginBottom: 10,
  },

  priceValue: {
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: 0.2,
  },

  priceUpdated: {
    opacity: 0.75,
    marginTop: 6,
    fontSize: 12,
  },

  footer: {
    opacity: 0.6,
    fontSize: 12,
    marginTop: 22,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    paddingTop: 14,
  },
};
