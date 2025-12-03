import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Optimize serverless function size by excluding heavy packages from server bundle
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Enable tree-shaking for MUI icons (they should only be in client bundles)
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
  },
  // Exclude build cache and unnecessary files from serverless function tracing
  outputFileTracingExcludes: {
    "*": [
      ".next/cache/**/*",
      "node_modules/@swc/core*",
      "node_modules/@esbuild/**/*",
      "node_modules/esbuild/**/*",
      "node_modules/webpack/**/*",
      "node_modules/terser/**/*",
    ],
  },
};

export default nextConfig;
