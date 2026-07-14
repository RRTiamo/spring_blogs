import type { NextConfig } from "next";

const serverApiBaseUrl = (
  process.env.SERVER_API_BASE_URL ??
  (process.env.NODE_ENV === "production"
    ? "http://127.0.0.1:8080/api"
    : "http://localhost:8080/api")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/music/:path*",
        destination: "/api/music/:path*",
      },
      {
        source: "/api/music",
        destination: "/api/music",
      },
      {
        source: "/api/:path*",
        destination: `${serverApiBaseUrl}/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
    ],
  },
};

export default nextConfig;
