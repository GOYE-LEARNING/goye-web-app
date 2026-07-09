/**
 * Translates English text into a target language code preserving tonal notations.
 * @param text The English string to translate
 * @param targetLanguageCode The ISO code (e.g., 'yo', 'ig', 'ha')
 */
export async function translateText(text: string, targetLanguageCode: string): Promise<string> {
  try {
    if (targetLanguageCode === "en") return text;

    // Use a direct Google API fetch structure optimized for raw content rendering
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguageCode}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    // Google returns a nested array layout: [[[translatedText, originalText, ...]]]
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0]; 
    }
    
    return text;
  } catch (error) {
    console.error(`Failed to dynamically translate to ${targetLanguageCode}:`, error);
    return text; // Fallback safely to original text if down
  }
}