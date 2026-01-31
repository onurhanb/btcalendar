import type { MetadataRoute } from "next";
import { posts } from "./blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://btcalendar.vercel.app";

  const blogUrls = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
    },
    ...blogUrls,
  ];
}
