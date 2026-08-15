import type { MetadataRoute } from "next";
import { allPages } from "@/lib/nav";

export const dynamic = "force-static";

const SITE_URL = "https://kumarmrmk.github.io";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function sitemap(): MetadataRoute.Sitemap {
  const pageEntries = allPages.map((p): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${base}${p.href}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: `${SITE_URL}${base}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...pageEntries,
  ];
}