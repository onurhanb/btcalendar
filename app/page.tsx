import CalendarClient from "./components/CalendarClient";
import PriceCardClient from "./components/PriceCardClient";

const CALENDAR_WIDTH = 1110; // ⬅️ takvimle birebir

export default function Page() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        {/* ÜST BAR — artık takvim genişliğine kilitli */}
        <div style={styles.topBarWrap}>
          <div style={styles.topBar}>
            <div style={styles.brandRow}>
              <div style={styles.brandIcon}>₿</div>
              <div style={styles.brandText}>
                <div style={styles.brandName}>BTCalendar</div>
                <div style={styles.brandMeta}>
                  Track Bitcoin daily prices.
                </div>
              </div>
            </div>

            <PriceCardClient />
          </div>
        </div>

        <CalendarClient />

<footer style={styles.footer}>
  <div style={styles.footerInner}>
    Prices are derived from Binance BTCUSDT daily candles (UTC 00:00–23:59). Open
    and Close correspond to the candle’s open and close.
  </div>
</footer>

      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 30% 0%, #1a2230 0%, #0b0f16 55%, #06080c 100%)",
    color: "#e7edf5",
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },

  shell: {
    maxWidth: 1220,
    margin: "0 auto",
    padding: "20px 16px 16px",
  },

  // 🔴 KRİTİK: üst bar artık takvim genişliğinde
  topBarWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 10,
  },

  topBar: {
    width: CALENDAR_WIDTH,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brandRow: { display: "flex", gap: 12, alignItems: "center" },
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
  brandText: { display: "flex", flexDirection: "column", gap: 4 },
  brandName: { fontSize: 20, fontWeight: 900 },
  brandMeta: { opacity: 0.75, fontSize: 13 },

footer: {
  opacity: 0.6,
  fontSize: 12,
  marginTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.10)",
  paddingTop: 12,
  display: "flex",
  justifyContent: "center",
},
footerInner: {
  width: 7 * 150 + 6 * 10, // CELL_W=150, GAP=10 ile takvimin sabit genişliği
  textAlign: "center",
},

};
