import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Practical, compatible CSP rather than a strict nonce-based policy:
// - 'unsafe-inline' on script-src is required because the Next.js App
//   Router streams RSC payloads via inline <script> tags on every page.
// - 'unsafe-inline' on style-src is required because Recharts sets
//   inline style attributes on its SVG elements.
// - 'unsafe-eval' on script-src is only added outside production because
//   Next dev (Turbopack HMR) relies on eval(); production builds don't.
// A nonce-based CSP would remove both 'unsafe-inline' needs but requires
// wiring a per-request nonce through the App Router (middleware +
// layout), which is out of scope for this hardening pass.
const scriptSrc = isProd
  ? "'self' 'unsafe-inline'"
  : "'self' 'unsafe-inline' 'unsafe-eval'";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Belt-and-suspenders with frame-ancestors above; some older browsers
  // only understand X-Frame-Options.
  { key: "X-Frame-Options", value: "DENY" },
];

if (isProd) {
  // Never sent outside production: HSTS on localhost/http breaks local dev.
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  });
}

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

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
