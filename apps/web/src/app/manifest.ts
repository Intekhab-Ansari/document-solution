import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IntekEdit — Privacy-First Document & Photo Suite",
    short_name: "IntekEdit",
    description: "Local-in-browser PDF & photo engineering with zero cloud uploads.",
    start_url: "/",
    display: "standalone",
    background_color: "#042f2e",
    theme_color: "#064e3b",
    icons: [
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
