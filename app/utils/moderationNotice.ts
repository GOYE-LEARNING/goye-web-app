/**
 * Reads the `moderation` block the backend returns when content is created or edited.
 * Content that is not PUBLISHED yet is saved but not visible to others, so the UI must say so
 * (and use the AI's note about what to change) instead of pretending it was posted.
 */
export type ModerationBlock = {
  status?: string;
  authorMessage?: string;
  flagged?: string[];
  isEdit?: boolean;
};

export type ModerationNotice = {
  /** true when the content is not live yet */
  held: boolean;
  tone: "success" | "info" | "error";
  text: string;
};

export function moderationNotice(
  response: { message?: string; moderation?: ModerationBlock } | null | undefined,
): ModerationNotice {
  const m = response?.moderation;
  if (!m || !m.status || m.status === "PUBLISHED") {
    return { held: false, tone: "success", text: response?.message || "" };
  }
  const quotes = (m.flagged ?? []).filter(Boolean).map((q) => `"${q}"`).join(", ");
  const text = quotes ? `${response?.message ?? ""} Flagged: ${quotes}`.trim() : response?.message || "";
  return {
    held: true,
    tone: m.status === "REJECTED" ? "error" : "info",
    text,
  };
}
