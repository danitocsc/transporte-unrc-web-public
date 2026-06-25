import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "100.81.77.128:3000",
    "192.168.100.7:3000",
    "100.81.77.128",
    "192.168.100.7"
  ],

  async redirects() {
    return [
      { source: "/", destination: "/mapa-demanda", permanent: false },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
