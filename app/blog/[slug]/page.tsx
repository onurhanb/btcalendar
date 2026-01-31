// app/blog/[slug]/page.tsx
import { posts } from "../posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamicParams = false;

const SITE = "https://btcalendar.vercel.app";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return posts.map((post) => ({ slug: post.slug }));
}

async function unwrapParams(params: { slug?: string } | Promise<{ slug?: string }>) {
  // @ts-ignore
  if (params && typeof (params as any).then === "function") return await params;
  return params as { slug?: string };
}

/**
 * Minimal Markdown -> HTML renderer (no deps).
 * Supports:
 * - Headings ##, ###
 * - Paragraphs (blank-line separated)
 * - Lists: - item / * item
 * - Links: [text](url)
 * - Bold: **text**
 * - Italic: *text*  (simple)
 * - Inline code: `code`
 * - Code blocks: ``` ... ```
 */
function mdToHtml(md: string) {
  const esc = (s: string) =>
    s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  // Eğer md dosyalarında yanlışlıkla \[ \] \* gibi escape koyduysan
  // bunu otomatik düzeltmek istersen AÇ:
  // md = md.replaceAll("\\[", "[").replaceAll("\\]", "]").replaceAll("\\*", "*");

  const inline = (s: string) => {
    let out = esc(s);

    // inline code: `...`
    out = out.replace(/`([^`]+)`/g, (_m, g1) => `<code>${esc(g1)}</code>`);

    // links: [text](url)
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
      const safeText = esc(text);
      const safeUrl = esc(url);
      const isExternal = /^https?:\/\//i.test(url);
      const rel = isExternal ? ' rel="noopener noreferrer"' : "";
      const target = isExternal ? ' target="_blank"' : "";
      return `<a href="${safeUrl}"${target}${rel}>${safeText}</a>`;
    });

    // bold: **text**
    out = out.replace(/\*\*([^*]+)\*\*/g, (_m, g1) => `<strong>${esc(g1)}</strong>`);

    // italic: *text* (avoid matching **bold** remnants)
    out = out.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?:;]|$)/g, (_m, p1, g2) => {
      return `${p1}<em>${esc(g2)}</em>`;
    });

    return out;
  };

  const lines = md.replaceAll("\r\n", "\n").split("\n");

  let html: string[] = [];
  let para: string[] = [];
  let inList = false;
  let inCode = false;
  let codeBuf: string[] = [];

  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${inline(para.join(" ").trim())}</p>`);
      para = [];
    }
  };

  const closeList = () => {
    if (inList) {
      html.push(`</ul>`);
      inList = false;
    }
  };

  for (const raw of lines) {
    const t = raw.trimEnd();

    // code fence
    if (t.trim().startsWith("```")) {
      if (!inCode) {
        flushPara();
        closeList();
        inCode = true;
        codeBuf = [];
      } else {
        const code = esc(codeBuf.join("\n"));
        html.push(`<pre><code>${code}</code></pre>`);
        inCode = false;
        codeBuf = [];
      }
      continue;
    }

    if (inCode) {
      codeBuf.push(raw);
      continue;
    }

    const l = t.trim();

    // blank
    if (!l) {
      flushPara();
      closeList();
      continue;
    }

    // headings
    if (l.startsWith("### ")) {
      flushPara();
      closeList();
      html.push(`<h3>${inline(l.slice(4))}</h3>`);
      continue;
    }
    if (l.startsWith("## ")) {
      flushPara();
      closeList();
      html.push(`<h2>${inline(l.slice(3))}</h2>`);
      continue;
    }

    // list items
    const isLi = l.startsWith("- ") || l.startsWith("* ");
    if (isLi) {
      flushPara();
      if (!inList) {
        html.push(`<ul>`);
        inList = true;
      }
      html.push(`<li>${inline(l.slice(2))}</li>`);
      continue;
    } else {
      closeList();
    }

    // paragraph
    para.push(l);
  }

  flushPara();
  closeList();

  if (inCode && codeBuf.length) {
    const code = esc(codeBuf.join("\n"));
    html.push(`<pre><code>${code}</code></pre>`);
  }

  return html.join("\n");
}

async function readPostMarkdown(slug: string) {
  const mdPath = path.join(process.cwd(), "app", "blog", "content", `${slug}.md`);
  return await fs.readFile(mdPath, "utf8");
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string } | Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const resolved = await unwrapParams(params);
  const raw = resolved?.slug;
  if (!raw) return {};

  const slug = decodeURIComponent(String(raw));
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};

  const url = `${SITE}/blog/${post.slug}`;
  const title = `${post.title} | BTCalendar`;
  const description = post.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "BTCalendar",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 760, margin: "0 auto", padding: "24px 0 10px" },

  header: { marginBottom: 18, textAlign: "center" },
  title: { fontSize: 30, fontWeight: 950, marginBottom: 10 },
  meta: { opacity: 0.75, margin: 0, fontSize: 13 },

  backRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 14,
  },
  backLink: {
    textDecoration: "none",
    color: "rgba(231,237,245,0.85)",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 13,
  },

  article: {
    lineHeight: 1.85,
    opacity: 0.92,
    fontSize: 15,
  },
};

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

  let md = "";
  try {
    md = await readPostMarkdown(slug);
  } catch {
    notFound();
  }

  const html = mdToHtml(md);

  // Article JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "BTCalendar" },
    publisher: { "@type": "Organization", name: "BTCalendar" },
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
  };

  return (
    <main style={styles.wrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={styles.backRow}>
        <Link href="/blog" style={styles.backLink}>
          ← Back to Blog
        </Link>
      </div>

      <header style={styles.header}>
        <h1 style={styles.title}>{post.title}</h1>
        <p style={styles.meta}>{new Date(post.date).toDateString()}</p>
      </header>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          article h2{
            font-size:18px;
            margin:22px 0 10px;
            font-weight:900;
            letter-spacing:-0.01em;
          }
          article h3{
            font-size:15px;
            margin:18px 0 8px;
            font-weight:900;
            opacity:0.95;
          }
          article p{ margin: 10px 0; }
          article ul{ margin: 10px 0 10px 18px; padding:0; }
          article li{ margin: 6px 0; }
          article a{
            color: rgba(247,147,26,0.95);
            text-decoration: none;
            border-bottom: 1px solid rgba(247,147,26,0.35);
          }
          article a:hover{
            border-bottom-color: rgba(247,147,26,0.65);
          }
          article code{
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 0.92em;
            padding: 2px 6px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(0,0,0,0.25);
          }
          article pre{
            overflow:auto;
            padding: 14px;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(0,0,0,0.25);
            margin: 14px 0;
          }
          article pre code{
            padding:0;
            border:none;
            background:transparent;
            font-size: 13px;
            display:block;
            line-height:1.6;
          }
        `,
        }}
      />

      <article style={styles.article} dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
