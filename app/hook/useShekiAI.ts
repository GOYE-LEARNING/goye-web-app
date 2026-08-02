// hook/useShekiAI.ts
//
// Drives the ShekiAI course-drafting assistant panel: session lifecycle via
// GOYE's proxy routes (courseDraftApi.ts), plus a socket connection straight
// to ShekiAI's own Socket.IO server for live progress events — a second,
// separate socket from GOYE's own SocketProvider/socketService, since
// ShekiAI runs its own realtime layer (see ShekiAI's src/realtime/socket.ts).
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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export type AssistantStatus = "idle" | "thinking" | "speaking" | "awaiting_approval" | "error";

const SHEKIAI_URL = process.env.NEXT_PUBLIC_SHEKIAI_URL;

export function useShekiAI() {
  const [tutorName, setTutorName] = useState("there");
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
        const res = await startCourseDraft(initialMessage);
        const result = res.data[0];
        setSessionId(result.sessionId);
        setCourseTitle(result.draft?.course_title || null);
        setMessages(
          initialMessage
            ? [
                { id: `u-${Date.now()}`, role: "user", content: initialMessage },
                { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply },
              ]
            : [{ id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply }],
        );
        setStatus(result.status === "AWAITING_APPROVAL" ? "awaiting_approval" : "idle");
        connectSocket(result.sessionId);
        return result;
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      } finally {
        setIsStarting(false);
      }
    },
    [connectSocket],
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
        const res = await sendCourseDraftMessage(sessionId, text);
        const result = res.data[0];
        setCourseTitle(result.draft?.course_title || null);
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply }]);
        setStatus(result.status === "AWAITING_APPROVAL" ? "awaiting_approval" : "idle");
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      }
    },
    [sessionId, start],
  );

  const sendVoice = useCallback(
    async (audioBlob: Blob) => {
      if (!sessionId) return;
      setStatus("thinking");
      setError(null);
      try {
        const res = await sendCourseDraftVoiceMessage(sessionId, audioBlob);
        const result = res.data[0];
        setCourseTitle(result.draft?.course_title || null);
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: "user", content: result.transcript },
          { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply },
        ]);
        setStatus(result.status === "AWAITING_APPROVAL" ? "awaiting_approval" : "idle");
        if (result.assistantReply) playReply(result.assistantReply);
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      }
    },
    [sessionId, playReply],
  );

  const finalize = useCallback(async () => {
    if (!sessionId) return null;
    const res = await finalizeCourseDraft(sessionId);
    return res.data[0]?.courseId as string | undefined;
  }, [sessionId]);

  const abandon = useCallback(async () => {
    if (!sessionId) return;
    await abandonCourseDraft(sessionId);
    socketRef.current?.disconnect();
    setSessionId(null);
    setMessages([]);
    setCourseTitle(null);
    setStatus("idle");
  }, [sessionId]);

  return {
    tutorName,
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
