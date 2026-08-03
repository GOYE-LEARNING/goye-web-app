// hook/useShekiAI.ts
//
// Drives the ShekiAI assistant panel in either mode — "tutor" (drafting a
// course) or "student" (finding a mentor) — via GOYE's proxy routes, plus a
// socket connection straight to ShekiAI's own Socket.IO server for live
// progress events. That socket is separate from GOYE's own
// SocketProvider/socketService, since ShekiAI runs its own realtime layer
// (see ShekiAI's src/realtime/socket.ts).
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getUserProfile } from "@/app/utils/database/db";
import {
  abandonCourseDraft,
  finalizeCourseDraft,
  sendCourseDraftMessage,
  sendCourseDraftVoiceMessage,
  speakCourseDraftText,
  startCourseDraft,
} from "@/app/utils/ai/courseDraftApi";
import {
  abandonMentorMatch,
  sendMentorMatchMessage,
  sendMentorMatchVoiceMessage,
  startMentorMatch,
} from "@/app/utils/ai/mentorMatchApi";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export type AssistantStatus = "idle" | "thinking" | "speaking" | "awaiting_approval" | "matched" | "error";

export type AssistantMode = "tutor" | "student";

export interface MatchedTutor {
  id: string;
  name: string;
  reason: string;
}

const SHEKIAI_URL = process.env.NEXT_PUBLIC_SHEKIAI_URL;

// Backend session statuses differ per mode (course-draft uses
// AWAITING_APPROVAL; mentor-match uses MATCHED / NO_MATCH), so map both
// onto the panel's own UI states in one place.
function statusFor(backendStatus: string): AssistantStatus {
  if (backendStatus === "AWAITING_APPROVAL") return "awaiting_approval";
  if (backendStatus === "MATCHED") return "matched";
  return "idle";
}

export function useShekiAI(mode: AssistantMode = "tutor") {
  const isStudent = mode === "student";
  const [tutorName, setTutorName] = useState("there");
  const [matchedTutor, setMatchedTutor] = useState<MatchedTutor | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<AssistantStatus>("idle");
  const [courseTitle, setCourseTitle] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    getUserProfile().then((profile) => {
      if (profile?.first_name) setTutorName(profile.first_name);
    });
  }, []);

  const playReply = useCallback(async (text: string) => {
    try {
      setStatus("speaking");
      const blob = await speakCourseDraftText(text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setStatus("idle");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      // Voice is a nice-to-have — never block the text reply on TTS failing.
      setStatus("idle");
    }
  }, []);

  const connectSocket = useCallback((sid: string) => {
    if (!SHEKIAI_URL) return;
    if (socketRef.current) socketRef.current.disconnect();

    const socket = io(SHEKIAI_URL, { transports: ["websocket", "polling"], withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/socket-token`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (data?.token) socket.emit("authenticate", { token: data.token });
    });

    socket.on("authenticated", (data: { success: boolean }) => {
      if (data.success) socket.emit("join_session", { sessionId: sid });
    });

    socket.on("thinking", () => setStatus("thinking"));
    socket.on("transcribing", () => setStatus("thinking"));

    socket.on("draft_updated", (evt: { payload: { draft: any } }) => {
      if (evt.payload?.draft?.course_title) setCourseTitle(evt.payload.draft.course_title);
    });

    socket.on("awaiting_approval", () => setStatus("awaiting_approval"));
    socket.on("error", (evt: { payload: { message: string } }) => {
      setError(evt.payload?.message || "Something went wrong");
      setStatus("error");
    });
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      audioRef.current?.pause();
    };
  }, []);

  const start = useCallback(
    async (initialMessage?: string) => {
      setIsStarting(true);
      setError(null);
      try {
        const res = isStudent ? await startMentorMatch(initialMessage) : await startCourseDraft(initialMessage);
        const result = res.data[0];
        setSessionId(result.sessionId);
        if (!isStudent) setCourseTitle(result.draft?.course_title || null);
        if (result.matchedTutor) setMatchedTutor(result.matchedTutor);
        setMessages(
          initialMessage
            ? [
                { id: `u-${Date.now()}`, role: "user", content: initialMessage },
                { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply },
              ]
            : [{ id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply }],
        );
        setStatus(statusFor(result.status));
        connectSocket(result.sessionId);
        return result;
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      } finally {
        setIsStarting(false);
      }
    },
    [connectSocket, isStudent],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!sessionId) {
        return start(text);
      }
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text }]);
      setStatus("thinking");
      setError(null);
      try {
        const res = isStudent ? await sendMentorMatchMessage(sessionId, text) : await sendCourseDraftMessage(sessionId, text);
        const result = res.data[0];
        if (!isStudent) setCourseTitle(result.draft?.course_title || null);
        if (result.matchedTutor) setMatchedTutor(result.matchedTutor);
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply }]);
        setStatus(statusFor(result.status));
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      }
    },
    [sessionId, start, isStudent],
  );

  const sendVoice = useCallback(
    async (audioBlob: Blob) => {
      if (!sessionId) return;
      setStatus("thinking");
      setError(null);
      try {
        const res = isStudent
          ? await sendMentorMatchVoiceMessage(sessionId, audioBlob)
          : await sendCourseDraftVoiceMessage(sessionId, audioBlob);
        const result = res.data[0];
        if (!isStudent) setCourseTitle(result.draft?.course_title || null);
        if (result.matchedTutor) setMatchedTutor(result.matchedTutor);
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: "user", content: result.transcript },
          { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply },
        ]);
        setStatus(statusFor(result.status));
        if (result.assistantReply) playReply(result.assistantReply);
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      }
    },
    [sessionId, playReply, isStudent],
  );

  const finalize = useCallback(async () => {
    if (!sessionId) return null;
    const res = await finalizeCourseDraft(sessionId);
    return res.data[0]?.courseId as string | undefined;
  }, [sessionId]);

  const abandon = useCallback(async () => {
    if (!sessionId) return;
    if (isStudent) await abandonMentorMatch(sessionId);
    else await abandonCourseDraft(sessionId);
    socketRef.current?.disconnect();
    setSessionId(null);
    setMessages([]);
    setCourseTitle(null);
    setMatchedTutor(null);
    setStatus("idle");
  }, [sessionId, isStudent]);

  return {
    tutorName,
    matchedTutor,
    sessionId,
    messages,
    status,
    courseTitle,
    isStarting,
    error,
    start,
    sendMessage,
    sendVoice,
    finalize,
    abandon,
  };
}
