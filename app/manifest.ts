import type { MetadataRoute } from "next";

// Served by Next at /manifest.webmanifest (linked from app/layout.tsx's
// metadata.manifest). Icons live in public/icons/, generated from the GOYE
// logo (192x192 / 512x512 / 512x512 safe-zone-padded maskable).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "GOYE",
    short_name: "GOYE",
    description: "GOYE — learn, connect, and grow with your community.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FFA500",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
