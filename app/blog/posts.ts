export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

export const posts: BlogPost[] = [
  {
    slug: "bitcoin-calendar-overview",
    title: "Bitcoin Calendar Overview",
    excerpt: "How daily BTC candles are visualized in a calendar format.",
    date: "2024-01-01",
  },
  {
    slug: "btc-daily-candles-explained",
    title: "BTC Daily Candles Explained",
    excerpt: "Understanding open, close and daily volatility in Bitcoin.",
    date: "2024-01-02",
  },
  {
    slug: "why-utc-matters-for-bitcoin",
    title: "Why UTC Matters for Bitcoin",
    excerpt: "Why all serious BTC analytics use UTC time.",
    date: "2024-01-03",
  },
  {
    slug: "bitcoin-volatility-calendar",
    title: "Bitcoin Volatility Calendar",
    excerpt: "Tracking volatility patterns month by month.",
    date: "2024-01-04",
  },
  {
    slug: "btc-usdt-vs-btc-usd",
    title: "BTCUSDT vs BTCUSD",
    excerpt: "Key differences between stablecoin and fiat pairs.",
    date: "2024-01-05",
  },
  {
    slug: "daily-close-strategy",
    title: "Daily Close Strategy",
    excerpt: "Why the daily close matters for traders.",
    date: "2024-01-06",
  },
  {
    slug: "bitcoin-market-cycles",
    title: "Bitcoin Market Cycles",
    excerpt: "A high-level look at Bitcoin market phases.",
    date: "2024-01-07",
  },
  {
    slug: "btc-calendar-for-investors",
    title: "BTC Calendar for Investors",
    excerpt: "Using calendars for long-term BTC analysis.",
    date: "2024-01-08",
  },
  {
    slug: "how-btcalendar-works",
    title: "How BTCalendar Works",
    excerpt: "Behind the scenes of the BTCalendar architecture.",
    date: "2024-01-09",
  },
];
