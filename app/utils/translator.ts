/**
 * Translates English text into a target language code.
 *
 * Goes through our own same-origin /api/translate route (server-side proxy +
 * cache) rather than calling translate.googleapis.com directly from the
 * browser — that direct call was CORS-fragile and uncached. Fails open to the
 * original text so the UI never breaks.
 *
 * @param text The English string to translate
 * @param targetLanguageCode The ISO code (e.g., 'yo', 'ig', 'ha')
 */
export async function translateText(
  text: string,
  targetLanguageCode: string,
): Promise<string> {
  if (!text || targetLanguageCode === "en") return text;

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target: targetLanguageCode }),
    });

    if (!res.ok) throw new Error(`translate route ${res.status}`);

    const data = await res.json();
    return data?.translation ?? text;
  } catch (error) {
    console.error(`Failed to translate to ${targetLanguageCode}:`, error);
    return text; // Fallback safely to original text.
  }
}

/**
 * Batch variant — translate many strings in one round-trip. Used by the i18n
 * provider to warm its cache for a whole screen at once.
 */
export async function translateBatch(
  texts: string[],
  targetLanguageCode: string,
): Promise<string[]> {
  if (texts.length === 0) return [];
  if (targetLanguageCode === "en") return texts;

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, target: targetLanguageCode }),
    });

    if (!res.ok) throw new Error(`translate route ${res.status}`);

    const data = await res.json();
    return Array.isArray(data?.translations) ? data.translations : texts;
  } catch (error) {
    console.error(`Failed to batch-translate to ${targetLanguageCode}:`, error);
    return texts;
  }
}
