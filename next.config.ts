import type { NextConfig } from "next";

import { securityHeaders } from "./app/lib/security-headers";

const nextConfig: NextConfig = {
  // Self-contained server in .next/standalone, for the Docker image.
  output: "standalone",
  // `task dev` behind a proxy (../develop): let the portal's public origin
  // reach the dev server's resources (hot reload).
  allowedDevOrigins: [
    new URL(process.env.NEXT_PUBLIC_CATALOG_WEB_URL ?? "http://localhost").hostname,
  ],
  // On every response; the Content Security Policy, with its nonce, is the
  // proxy's (`proxy.ts`).
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
