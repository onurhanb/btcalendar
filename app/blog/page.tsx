const posts = [
  { slug: "what-is-a-bitcoin-candle", title: "What is a Bitcoin candle?", excerpt: "Open, close, and daily change explained." },
  { slug: "btc-calendar-strategy", title: "Using a calendar view for BTC", excerpt: "Why month-based views help spotting regimes." },
  { slug: "utc-vs-local-time", title: "UTC vs local time in crypto charts", excerpt: "Why your day boundaries matter." },
];

export default function BlogPage() {
  return (
    <main style={{ padding: "14px 0" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 14 }}>Blog</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {posts.map((p) => (
          <a
            key={p.slug}
            href={`/blog/${p.slug}`}
            style={{
              textDecoration: "none",
              color: "#e7edf5",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.18)",
              borderRadius: 14,
              padding: 14,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{p.title}</div>
            <div style={{ opacity: 0.75, lineHeight: 1.5 }}>{p.excerpt}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
