import type { NextConfig } from "next";

/**
 * Sent with every response. There's no script policy in the CSP: Next's
 * inline scripts would need a per-request nonce. These still stop other sites
 * framing this one (clickjacking), MIME sniffing, and full URLs leaking to
 * other sites through the Referer header.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  // frame-ancestors for browsers too old to read it.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HTTPS only, for this host alone: includeSubDomains would bind every
  // other subdomain of the parent domain too.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server.js, which is what the
  // production Docker image runs.
  output: "standalone",
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  images: {
    // The image optimizer stays off until something uses next/image, rather
    // than leaving /_next/image open to fetch and decode images for anyone.
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
