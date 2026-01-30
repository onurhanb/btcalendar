export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

export const posts: BlogPost[] = [
  {
    slug: "01-bitcoin-calendar-overview",
    title: "Bitcoin Calendar Overview",
    excerpt: "How daily BTC candles are visualized in a calendar format.",
    date: "2026-01-22",
  },
  {
    slug: "02-btc-daily-candles-explained",
    title: "BTC Daily Candles Explained",
    excerpt: "Understanding open, close and daily volatility in Bitcoin.",
    date: "2026-01-23",
  },
  {
    slug: "03-why-utc-matters-for-bitcoin",
    title: "Why UTC Matters for Bitcoin",
    excerpt: "Why all serious BTC analytics use UTC time.",
    date: "2026-01-24",
  },
  {
    slug: "04-bitcoin-volatility-calendar",
    title: "Bitcoin Volatility Calendar",
    excerpt: "Tracking volatility patterns month by month.",
    date: "2026-01-25",
  },
  {
    slug: "05-btc-usdt-vs-btc-usd",
    title: "BTCUSDT vs BTCUSD",
    excerpt: "Key differences between stablecoin and fiat pairs.",
    date: "2026-01-26",
  },
  {
    slug: "06-daily-close-strategy",
    title: "Daily Close Strategy",
    excerpt: "Why the daily close matters for traders.",
    date: "2026-01-27",
  },
  {
    slug: "07-bitcoin-market-cycles",
    title: "Bitcoin Market Cycles",
    excerpt: "A high-level look at Bitcoin market phases.",
    date: "2026-01-28",
  },
  {
    slug: "08-btc-calendar-for-investors",
    title: "BTC Calendar for Investors",
    excerpt: "Using calendars for long-term BTC analysis.",
    date: "2026-01-29",
  },
  {
    slug: "09-how-btcalendar-works",
    title: "How BTCalendar Works",
    excerpt: "Behind the idea of the BTCalendar architecture.",
    date: "2026-01-30",
  },
];
