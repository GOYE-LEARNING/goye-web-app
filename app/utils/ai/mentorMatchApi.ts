// utils/ai/mentorMatchApi.ts
//
// Client for GOYE's mentor-match proxy routes (which call ShekiAI
// server-to-server). Mirrors courseDraftApi.ts.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function call(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}/api/mentor-match${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export async function startMentorMatch(message?: string) {
  return call("/start", { method: "POST", body: JSON.stringify({ message }) });
}

export async function sendMentorMatchMessage(sessionId: string, message: string) {
  return call(`/${sessionId}/message`, { method: "POST", body: JSON.stringify({ message }) });
}

export async function sendMentorMatchVoiceMessage(sessionId: string, audioBlob: Blob) {
  const form = new FormData();
  form.append("audio", audioBlob, "voice-message.webm");
  const res = await fetch(`${API_URL}/api/mentor-match/${sessionId}/voice-message`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export async function abandonMentorMatch(sessionId: string) {
  return call(`/${sessionId}/abandon`, { method: "POST" });
}

export async function sendMentorMatchDocument(sessionId: string, file: File) {
  const form = new FormData();
  form.append("document", file, file.name);
  const res = await fetch(`${API_URL}/api/mentor-match/${sessionId}/document`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
