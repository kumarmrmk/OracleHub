import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://kumarmrmk.github.io";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}${base}/sitemap.xml`,
  };
}