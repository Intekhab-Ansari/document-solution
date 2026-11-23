import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/*.png$", "/*.svg$", "/*.ico$"],
      },
    ],
    sitemap: "https://intekedit.vercel.app/sitemap.xml",
  };
}
