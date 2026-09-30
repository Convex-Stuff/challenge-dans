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
    // form-action allows osu.ppy.sh because signing in redirects there.
    value:
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self' https://osu.ppy.sh",
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
    // Nothing uses next/image (avatars are plain <img> tags), so the image
    // optimizer stays off rather than leaving /_next/image open to fetch and
    // decode images for anyone who asks.
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
