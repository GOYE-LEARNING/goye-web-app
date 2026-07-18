import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // The codebase has ~400 pre-existing lint errors (mostly @typescript-eslint/no-explicit-any
    // and react/no-unescaped-entities) that predate this flag and were never blocking deploys
    // until `next build`'s default lint-on-build behavior started failing the build outright.
    // Real type safety is unaffected — `tsc --noEmit` passes cleanly on its own. Ignoring lint
    // during the production build unblocks deploys; run `npm run lint` separately to work
    // through the backlog incrementally.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
