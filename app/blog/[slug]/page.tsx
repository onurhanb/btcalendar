// app/blog/[slug]/page.tsx
import { posts } from "../posts";
import { notFound } from "next/navigation";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return posts.map((post) => ({ slug: post.slug }));
}

async function unwrapParams(
  params: { slug?: string } | Promise<{ slug?: string }>
) {
  // @ts-ignore
  if (params && typeof (params as any).then === "function") return await params;
  return params as { slug?: string };
}

// Basit, minimal “markdown to HTML” (başlangıç için)
// Sonra istersen MDX/remark ekleriz.
function mdToHtml(md: string) {
  const esc = (s: string) =>
    s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  const lines = md.split("\n");

  const html = lines
    .map((line) => {
      const l = line.trimEnd();

      // headings
      if (l.startsWith("### ")) return `<h3>${esc(l.slice(4))}</h3>`;
      if (l.startsWith("## ")) return `<h2>${esc(l.slice(3))}</h2>`;
      if (l.startsWith("# ")) return `<h1>${esc(l.slice(2))}</h1>`;

      // blank
      if (!l.trim()) return "";

      // paragraphs
      return `<p>${esc(l)}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return html;
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug?: string } | Promise<{ slug?: string }>;
}) {
  const resolved = await unwrapParams(params);
  const raw = resolved?.slug;

  if (!raw) notFound();

  const slug = decodeURIComponent(String(raw));
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  // app/blog/content/<slug>.md
  const mdPath = path.join(process.cwd(), "app", "blog", "content", `${slug}.md`);

  let md = "";
  try {
    md = await fs.readFile(mdPath, "utf8");
  } catch {
    // md dosyası yoksa 404 (veya istersen fallback lorem)
    notFound();
  }

  const html = mdToHtml(md);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 0" }}>
      <header style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {post.title}
        </h1>

        <p style={{ opacity: 0.75, textAlign: "center", margin: 0 }}>
          {new Date(post.date).toDateString()}
        </p>
      </header>

      <article
        style={{ lineHeight: 1.7, opacity: 0.9 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
