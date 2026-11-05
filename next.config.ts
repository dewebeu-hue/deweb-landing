import type { NextConfig } from "next";

// Candidate policy: Next.js emits inline hydration scripts. Keep this report-only
// until a nonce/hash strategy passes Preview QA; changing the header to enforcing
// would otherwise break hydration. No reporting service is configured.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        // Development uses HMR/eval; acceptance tests use a production build.
        ...(process.env.NODE_ENV === "development" ? [] : [{
          key: "Content-Security-Policy-Report-Only",
          value: contentSecurityPolicy,
        }]),
      ],
    }];
  },
};

export default nextConfig;
