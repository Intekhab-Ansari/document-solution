import type { MetadataRoute } from "next";
import { ALL_TOOLS } from "@/lib/registry/tools-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://intekedit.vercel.app";

  const hubPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pdf`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/image`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/convert`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/extract`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/test-files`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const toolUrls: MetadataRoute.Sitemap = ALL_TOOLS.filter((t) => t.isAvailable).map((t) => ({
    url: `${baseUrl}${t.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: t.badge === "POPULAR" || t.badge === "TARGET KB" || t.badge === "FULL STUDIO" ? 0.9 : 0.85,
  }));

  // Ensure unique URLs
  const seen = new Set<string>();
  const combined = [...hubPages, ...toolUrls].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  return combined;
}
