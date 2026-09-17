import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/rent-roll",
        destination: "/operate/rent-roll",
        permanent: false,
      },
      {
        source: "/compliance-calendar",
        destination: "/operate/compliance",
        permanent: false,
      },
      {
        source: "/cafm",
        destination: "/operate/ppm",
        permanent: false,
      },
      {
        source: "/ppm",
        destination: "/operate/ppm",
        permanent: false,
      },
      {
        source: "/speed-gates",
        destination: "/operate/visitors",
        permanent: false,
      },
      {
        source: "/lease-crm",
        destination: "/operate/lease-crm",
        permanent: false,
      },
      {
        source: "/tenant-helpdesk",
        destination: "/operate/helpdesk",
        permanent: false,
      },
    ];
  }
};

export default nextConfig;
