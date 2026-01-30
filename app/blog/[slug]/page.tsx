// app/blog/[slug]/page.tsx
import { posts } from "../posts";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return posts.map((post) => ({ slug: post.slug }));
}

// params bazen Promise gelebiliyor → unwrap
async function unwrapParams(
  params: { slug?: string } | Promise<{ slug?: string }>
) {
  // @ts-ignore
  if (params && typeof (params as any).then === "function") return await params;
  return params as { slug?: string };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug?: string } | Promise<{ slug?: string }>;
}) {
  const resolved = await unwrapParams(params);
  const raw = resolved?.slug;

  if (!raw) {
    if (process.env.NODE_ENV !== "production") {
      return (
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 0" }}>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>
            DEBUG: slug is missing
          </h1>
          <pre style={{ opacity: 0.8, marginTop: 12 }}>
            {JSON.stringify(
              { receivedParams: resolved, availableSlugs: posts.map((p) => p.slug) },
              null,
              2
            )}
          </pre>
        </main>
      );
    }
    notFound();
  }

  const slug = decodeURIComponent(String(raw));
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 0" }}>
      {/* Blog/About ile aynı “başlık bandı” hizası */}
      <header style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontSize: 28, // Blog/About ile aynı
            fontWeight: 900,
            marginBottom: 10,
            textAlign: "center", // Blog/About gibi ortalı
          }}
        >
          {post.title}
        </h1>

        <p style={{ opacity: 0.75, textAlign: "center", margin: 0 }}>
          {new Date(post.date).toDateString()}
        </p>
      </header>

      <article style={{ lineHeight: 1.7, opacity: 0.85 }}>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.</p>
      </article>
    </main>
  );
}
