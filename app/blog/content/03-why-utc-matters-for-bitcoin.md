## Why UTC Matters for Bitcoin

Time consistency is critical for crypto analytics.

Bitcoin trades 24/7.  
There is no market close.

So exchanges define candles using **UTC time**.

## What happens without UTC?

If everyone uses local time:

- candles mismatch
- indicators break
- backtests become unreliable

## Binance standard

BTCalendar uses:

UTC 00:00 → 23:59

This matches Binance daily candles exactly.

## Why you should care

If you compare TradingView, Binance and analytics tools, UTC alignment ensures:

- identical candles
- consistent backtests
- accurate signals

## Related

- [Bitcoin Calendar Overview](/blog/01-bitcoin-calendar-overview)
