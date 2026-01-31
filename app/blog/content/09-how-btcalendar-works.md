## Overview

BTCalendar turns daily BTC/USDT candles into a calendar view so you can spot streaks, volatility clusters, and trend shifts without noisy charts.

- See the calendar on the [Home page](/).
- Read next: [Why UTC matters for Bitcoin](/blog/03-why-utc-matters-for-bitcoin).

## Data source

BTCalendar uses Binance **BTCUSDT daily candles** (UTC 00:00–23:59). Each calendar tile maps to a single daily candle:

- **Open**: candle open price
- **Close**: candle close price
- **% Change**: (Close − Open) / Open

## Why this design works

A calendar layout helps you:

1. Identify consecutive green/red streaks
2. Notice regime changes (low → high volatility)
3. Compare months quickly

## FAQ

### What time does the daily candle close?

BTCalendar uses UTC, so the daily candle closes at **23:59 UTC** (and the next candle opens at 00:00 UTC).

### Does it work for investors?

Yes — long-term investors can use the calendar to compare months and identify market phases.

---

**Related posts**

- [BTCUSDT vs BTCUSD](/blog/05-btc-usdt-vs-btc-usd)
- [Bitcoin daily candles explained](/blog/02-btc-daily-candles-explained)
