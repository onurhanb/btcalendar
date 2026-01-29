export default function AboutPage() {
  return (
    <main
      style={{
        padding: "0px 0",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          About
        </h1>

        <p
          style={{
            opacity: 0.8,
            lineHeight: 1.7,
            fontSize: 15,
          }}
        >
          BTCalendar presents Bitcoin (BTC/USDT) daily price action in a clean,
          calendar-based layout. Each day represents a single daily candle derived
          from Binance spot market data, using UTC time (00:00–23:59).

          <br /><br />

          The goal of BTCalendar is simplicity: removing noisy charts and focusing
          purely on daily structure, momentum, and context. This makes it easier
          to spot patterns, streaks, volatility clusters, and behavioral market
          phases at a glance.

          <br /><br />

          All price data is fetched directly from Binance daily candles. Open and
          Close values correspond to the candle’s opening and closing prices for
          each day.
        </p>
      </div>
    </main>
  );
}
