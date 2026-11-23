import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://calendly.com;
  connect-src 'self' https://*.supabase.co https://api.razorpay.com https://maps.googleapis.com https://*.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
            key: "Content-Security-Policy",
            value: cspHeader
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)"
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none"
          },
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
  async rewrites() {
    return [];
  },
  async redirects() {
    return [
      {
        source: "/public/search",
        destination: "/marketplace/search",
        permanent: false,
      },
      {
        source: "/operations",
        destination: "/operate",
        permanent: false,
      },
      {
        source: "/ops",
        destination: "/operate",
        permanent: false,
      },
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
      {
        source: "/portal/document",
        destination: "/portal/documents",
        permanent: false,
      },
      {
        source: "/portal/noc",
        destination: "/portal/documents",
        permanent: false,
      },
      {
        source: "/portal/nocs",
        destination: "/portal/documents",
        permanent: false,
      },
      {
        source: "/tenant",
        destination: "/portal",
        permanent: false,
      },
      {
        source: "/tenant/:path*",
        destination: "/portal/:path*",
        permanent: false,
      },
    ];
  }
};

export default nextConfig;
