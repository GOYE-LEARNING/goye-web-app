// utils/ai/courseDraftApi.ts
//
// Client for GOYE's own course-draft proxy routes (which in turn call
// ShekiAI server-to-server). Relies on the same httpOnly accessToken
// cookie every other authenticated fetch in this app uses.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function call(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}/api/course-draft${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export async function startCourseDraft(message?: string) {
  return call("/start", { method: "POST", body: JSON.stringify({ message }) });
}

export async function sendCourseDraftMessage(sessionId: string, message: string) {
  return call(`/${sessionId}/message`, { method: "POST", body: JSON.stringify({ message }) });
}

export async function sendCourseDraftVoiceMessage(sessionId: string, audioBlob: Blob) {
  const form = new FormData();
  form.append("audio", audioBlob, "voice-message.webm");
  const res = await fetch(`${API_URL}/api/course-draft/${sessionId}/voice-message`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export async function getCourseDraftSession(sessionId: string) {
  return call(`/${sessionId}`);
}

export async function listCourseDraftSessions() {
  return call("/mine/list");
}

export async function finalizeCourseDraft(sessionId: string) {
  return call(`/${sessionId}/finalize`, { method: "POST" });
}

export async function abandonCourseDraft(sessionId: string) {
  return call(`/${sessionId}/abandon`, { method: "POST" });
}

export async function speakCourseDraftText(text: string): Promise<Blob> {
  const res = await fetch(`${API_URL}/api/course-draft/voice/speak`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "TTS failed");
  }
  return res.blob();
}

export async function sendCourseDraftDocument(sessionId: string, file: File) {
  const form = new FormData();
  form.append("document", file, file.name);
  const res = await fetch(`${API_URL}/api/course-draft/${sessionId}/document`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
