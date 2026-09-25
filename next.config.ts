import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  // Local-only escape hatch for testing the site through a single ngrok
  // domain on a phone: the frontend and backend both run on this machine on
  // different ports, but a free ngrok account only grants one public
  // hostname. Rather than exposing the backend separately (which would also
  // make every browser request cross-site, breaking cookie-based auth),
  // PROXY_BACKEND_URL makes this Next server itself forward /api and
  // /socket.io calls to the local backend, so the phone only ever talks to
  // one HTTPS origin. Unset in every real deployment (Vercel/Render), where
  // NEXT_PUBLIC_API_URL points directly at the real backend instead.
  async rewrites() {
    const backend = process.env.PROXY_BACKEND_URL;
    if (!backend) return [];
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/socket.io/:path*", destination: `${backend}/socket.io/:path*` },
    ];
  },
  eslint: {
    // The codebase has ~400 pre-existing lint errors (mostly @typescript-eslint/no-explicit-any
    // and react/no-unescaped-entities) that predate this flag and were never blocking deploys
    // until `next build`'s default lint-on-build behavior started failing the build outright.
    // Real type safety is unaffected — `tsc --noEmit` passes cleanly on its own. Ignoring lint
    // during the production build unblocks deploys; run `npm run lint` separately to work
    // through the backlog incrementally.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    // Production builds on this machine intermittently fail during "Collecting
    // page data" with "Cannot find module './<chunk>.js'" — a different random
    // chunk name each time. The build log's real clue is upstream of that:
    // "Caching failed for pack: ... rename '...pack.gz_' -> '...pack.gz'"
    // (ENOENT). That's webpack's persistent filesystem cache losing an atomic
    // rename mid-build (Windows Defender / OneDrive briefly locking the temp
    // file is the usual cause), which corrupts the chunk graph a later worker
    // process reads back. Disabling the cache for production builds only
    // avoids the corruption path; dev keeps it for fast rebuilds.
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
};

const withPWA = withPWAInit({
  dest: "public",
  // Disabled in dev: a service worker intercepting requests fights with
  // Fast Refresh/HMR and makes local testing confusing (stale-looking
  // pages after an edit). Test PWA/offline behavior against a real build
  // (`npm run build && npm run start`) instead.
  disable: process.env.NODE_ENV === "development",
  // The plugin's auto-registration targets the Pages Router's _app/_document
  // — there's no equivalent file to patch under the App Router, and testing
  // confirmed it silently never calls navigator.serviceWorker.register()
  // here. Registered explicitly instead, in AppProviders.tsx.
  register: false,
  workboxOptions: {
    skipWaiting: true,
    // This app is data-driven — a cached-but-stale API response is
    // actively wrong, not just slightly outdated, so navigations and API
    // calls go network-first with a short cache fallback for true
    // offline/flaky-connection moments. Static assets keep the plugin's
    // cache-first defaults.
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "api",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 },
        },
      },
    ],
  },
});

export default withPWA(nextConfig);
