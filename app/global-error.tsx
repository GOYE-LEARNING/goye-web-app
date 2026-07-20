"use client";

import { useEffect } from "react";

// This only fires if the root layout itself throws, so it deliberately
// does not depend on any app context/provider/hook — those may be exactly
// what crashed. It must render its own <html>/<body> since it replaces
// the entire root layout while active.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled root-level application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily:
            "'Fustat', 'Inter', system-ui, -apple-system, sans-serif",
          backgroundColor: "#ffffff",
          color: "#1F2130",
        }}
      >
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>🙏</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            This isn't the end of the story
          </h1>
          <p style={{ color: "#9CA3B0", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            Something unexpected happened while loading the app. Take a
            breath — let's try that again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#FFA500",
              color: "#ffffff",
              borderRadius: "0.75rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
