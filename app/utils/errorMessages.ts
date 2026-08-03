// utils/errorMessages.ts
//
// Simple, specific validation messages ("Please enter your email") are
// already clear on their own and should stay exactly as they are — this
// utility is only for the OTHER category: raw network/server failures that
// would otherwise surface as "Failed to fetch" or a bare "500", which mean
// nothing to someone filling out a form. Those get a calm, gently
// faith-toned message instead — never a lie about what happened, just
// something encouraging instead of a stack trace.
export function getFriendlyErrorMessage(error: unknown, context?: string): string {
  const raw = String((error as any)?.message ?? error ?? "");
  const suffix = context ? ` ${context}` : "";

  if (raw.includes("Failed to fetch") || raw.includes("NetworkError") || /network/i.test(raw)) {
    return "We couldn't reach the server just now — be encouraged, nothing you've entered has been lost. Please check your connection and try again.";
  }
  if (raw.includes(": 401") || raw.includes(": 403") || /unauthorized/i.test(raw)) {
    return "Your session needs a refresh. Please log in again — we'll be right here when you get back.";
  }
  if (raw.includes(": 500") || raw.includes(": 502") || raw.includes(": 503") || raw.includes(": 504")) {
    return `Something didn't go through on our end${suffix}, but don't lose heart — your details are still safe here. Please try again in a moment.`;
  }
  return `We hit a snag${suffix}, but every setback is a setup for a comeback — please try again.`;
}
