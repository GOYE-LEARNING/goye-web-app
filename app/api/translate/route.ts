import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side translation proxy.
 *
 * Why this exists:
 *  - The old client-side call hit translate.googleapis.com directly from the
 *    browser, which is CORS-fragile (breaks on non-allowlisted dev ports) and
 *    re-fetches on every render.
 *  - Running it here (same-origin) removes CORS entirely and lets us cache
 *    results in the server process, so repeated strings are translated once.
 *
 * Accepts a single string or an array (batch), so a page can translate all
 * its strings in one round-trip.
 */

// Simple in-process cache. Keyed `${target}:${text}`. Bounded so a long-running
// server doesn't grow unbounded.
const cache = new Map<string, string>();
const MAX_CACHE = 5000;

function cacheGet(key: string): string | undefined {
  return cache.get(key);
}

function cacheSet(key: string, value: string) {
  if (cache.size >= MAX_CACHE) {
    // Evict the oldest entry (Map preserves insertion order).
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

async function translateOne(text: string, target: string): Promise<string> {
  if (!text || target === "en") return text;

  const key = `${target}:${text}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
      target,
    )}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`translate upstream ${res.status}`);

    const data = await res.json();
    // Google returns [[[translated, original, ...], ...], ...]. Multi-segment
    // long strings come back as several chunks we join.
    let out = text;
    if (Array.isArray(data) && Array.isArray(data[0])) {
      out = data[0]
        .map((seg: any) => (Array.isArray(seg) ? seg[0] : ""))
        .join("");
      if (!out) out = text;
    }

    cacheSet(key, out);
    return out;
  } catch (err) {
    console.error(`[translate] failed for "${text.slice(0, 40)}" -> ${target}:`, err);
    // Fail open: return the original text so the UI never breaks.
    return text;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const target: string = body?.target || body?.targetLanguageCode || "en";
    const single: string | undefined = body?.text;
    const batch: string[] | undefined = body?.texts;

    if (!target || target === "en") {
      // Nothing to do — echo back.
      if (Array.isArray(batch)) return NextResponse.json({ translations: batch });
      return NextResponse.json({ translation: single ?? "" });
    }

    if (Array.isArray(batch)) {
      const translations = await Promise.all(batch.map((t) => translateOne(t, target)));
      return NextResponse.json({ translations });
    }

    if (typeof single === "string") {
      const translation = await translateOne(single, target);
      return NextResponse.json({ translation });
    }

    return NextResponse.json({ error: "Provide `text` or `texts`" }, { status: 400 });
  } catch (err) {
    console.error("[translate] route error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
