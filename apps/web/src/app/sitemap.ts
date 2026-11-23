import type { MetadataRoute } from "next";
import { ALL_TOOLS } from "@/lib/registry/tools-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://intekedit.vercel.app";

  const toolUrls = ALL_TOOLS.filter((t) => t.isAvailable).map((t) => ({
    url: `${baseUrl}${t.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: t.badge === "POPULAR" ? 0.9 : 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    ...toolUrls,
  ];
}
