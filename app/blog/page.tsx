// app/blog/page.tsx
import Link from "next/link";
import { posts } from "./posts";

export default function BlogPage() {
  const sorted = [...posts].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 0" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 18, textAlign: "center" }}>
        Blog
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {sorted.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${encodeURIComponent(p.slug)}`}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)",
              borderRadius: 14,
              padding: 16,
              textDecoration: "none",
              color: "#e7edf5",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{p.title}</div>

            {/* tarih */}
            <div style={{ opacity: 0.65, fontSize: 12, marginBottom: 10 }}>
              {new Date(p.date).toDateString()}
            </div>

            {/* excerpt */}
            <div style={{ opacity: 0.8, fontSize: 13, lineHeight: 1.5 }}>
              {p.excerpt}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
