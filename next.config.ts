import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Domaines autorisés selon l'environnement
const blobHost = process.env.BLOB_STORE_HOST ?? "*.public.blob.vercel-storage.com";

const cspDirectives = [
  "default-src 'self'",
  `img-src 'self' data: blob: ${blobHost}`,
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // unsafe-eval requis par Next.js/Turbopack en dev uniquement
  `script-src 'self' ${isDev ? "'unsafe-eval'" : ""} 'unsafe-inline' https://js.stripe.com`.trim(),
  `connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://api.stripe.com ${blobHost}`,
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "worker-src blob:",
].map((d) => d.trim());

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // HSTS : activé uniquement hors dev (HTTPS requis)
  ...(!isDev
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
