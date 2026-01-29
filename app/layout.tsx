import type { Metadata } from "next";
import TopBar from "./components/TopBar";
import { CAL_W } from "./components/CalendarClient";

export const metadata: Metadata = {
  title: "BTCalendar | Track Bitcoin daily prices.",
  description: "Track Bitcoin daily prices.",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 30% 0%, #1a2230 0%, #0b0f16 55%, #06080c 100%)",
    color: "#e7edf5",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    // önemli: dar ekranda yatay scroll olmasın
    overflowX: "hidden",
  },

  // dış sarmal: her şeyi ortalar
  outer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "20px 16px 16px",
    boxSizing: "border-box",
  },

  // frame: TopBar + sayfa içeriği + footer'ın ortak genişliği
  shell: {
    width: CAL_W,       // 🔥 takvimle birebir aynı
    maxWidth: "100%",   // 🔥 ekran daralınca küçülebilsin
  },

  footer: {
    opacity: 0.6,
    fontSize: 12,
    marginTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    paddingTop: 12,
    textAlign: "center",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={styles.page}>
        <div style={styles.outer}>
          <div style={styles.shell}>
            <TopBar />

            {/* SADECE BURASI DEĞİŞİR */}
            {children}

            <footer style={styles.footer}>
              Prices are derived from Binance BTCUSDT daily candles (UTC 00:00–23:59).
              Open and Close correspond to the candle’s open and close.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
