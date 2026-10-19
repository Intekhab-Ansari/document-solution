import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
    resolveAlias: {
      fs: path.resolve(__dirname, "src/lib/empty.js"),
      path: path.resolve(__dirname, "src/lib/empty.js"),
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
