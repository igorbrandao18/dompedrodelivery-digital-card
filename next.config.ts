import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "**.dompedrodelivery.com.br" },
      { hostname: "**.amazonaws.com" },
      { hostname: "**.cloudfront.net" },
    ],
  },
};

export default nextConfig;
