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
  sendCourseDraftDocument,
  speakCourseDraftText,
  startCourseDraft,
} from "@/app/utils/ai/courseDraftApi";
import {
  abandonMentorMatch,
  sendMentorMatchMessage,
  sendMentorMatchVoiceMessage,
  sendMentorMatchDocument,
  startMentorMatch,
} from "@/app/utils/ai/mentorMatchApi";

export interface TutorCandidate {
  id: string;
  name: string;
  bio: string | null;
  church_role: string | null;
  courses: { id: string; title: string }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  // Only set on the assistant reply from the turn that actually ran a fresh
  // search_tutors — lets the panel show real, clickable candidates right
  // where they were found instead of leaving them as plain prose.
  tutorCandidates?: TutorCandidate[];
}

export type AssistantStatus = "idle" | "listening" | "thinking" | "speaking" | "awaiting_approval" | "matched" | "error";

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
  // When on, every assistant reply is spoken aloud, not just replies to
  // spoken input — that's what makes it feel like a conversation rather
  // than a transcript.
  const [voiceMode, setVoiceMode] = useState(false);
  // 0..1 loudness of the assistant's own voice, so the orb can pulse in
  // time with what's actually being said instead of on a fixed timer.
  const [speakingLevel, setSpeakingLevel] = useState(0);

  // Candidates from a student's last search_tutors call — every turn's
  // result carries the full (persisted) state, so without this we'd
  // re-attach the same stale cards to every unrelated reply after it.
  const lastCandidateIdsRef = useRef<string>("");
  const candidatesForTurn = useCallback((state: any): TutorCandidate[] | undefined => {
    const candidates: TutorCandidate[] | undefined = state?.candidates;
    if (!candidates?.length) return undefined;
    const ids = candidates
      .map((c) => c.id)
      .sort()
      .join(",");
    if (ids === lastCandidateIdsRef.current) return undefined;
    lastCandidateIdsRef.current = ids;
    return candidates;
  }, []);

  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const voiceModeRef = useRef(false);
  voiceModeRef.current = voiceMode;

  useEffect(() => {
    getUserProfile().then((profile) => {
      if (profile?.first_name) setTutorName(profile.first_name);
    });
  }, []);

  // Resolves once the assistant has finished speaking, so a voice
  // conversation can hand the microphone straight back afterwards.
  const playReply = useCallback(async (text: string) => {
    try {
      setStatus("speaking");
      const blob = await speakCourseDraftText(text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;

      // Route through Web Audio so the orb can react to real amplitude.
      // Must also connect to the destination or playback goes silent.
      try {
        const ctx = audioCtxRef.current ?? new AudioContext();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;

        const buffer = new Float32Array(analyser.fftSize);
        const tick = () => {
          if (!analyserRef.current) return;
          analyser.getFloatTimeDomainData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
          setSpeakingLevel(Math.min(1, Math.sqrt(sum / buffer.length) * 8));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        // Amplitude metering is a nicety — never let it stop playback.
      }

      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      analyserRef.current = null;
      setSpeakingLevel(0);
      setStatus("idle");
      URL.revokeObjectURL(url);
    } catch {
      // Voice is a nice-to-have — never block the text reply on TTS failing.
      setSpeakingLevel(0);
      setStatus("idle");
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current = null;
    setSpeakingLevel(0);
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
        const tutorCandidates = isStudent ? candidatesForTurn(result.state) : undefined;
        setMessages(
          initialMessage
            ? [
                { id: `u-${Date.now()}`, role: "user", content: initialMessage },
                { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply, tutorCandidates },
              ]
            : [{ id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply, tutorCandidates }],
        );
        setStatus(statusFor(result.status));
        connectSocket(result.sessionId);
        if (voiceModeRef.current && result.assistantReply) await playReply(result.assistantReply);
        return result;
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      } finally {
        setIsStarting(false);
      }
    },
    [connectSocket, isStudent, playReply, candidatesForTurn],
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
        const tutorCandidates = isStudent ? candidatesForTurn(result.state) : undefined;
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply, tutorCandidates }]);
        setStatus(statusFor(result.status));
        if (voiceModeRef.current && result.assistantReply) await playReply(result.assistantReply);
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      }
    },
    [sessionId, start, isStudent, playReply, candidatesForTurn],
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
        const tutorCandidates = isStudent ? candidatesForTurn(result.state) : undefined;
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: "user", content: result.transcript },
          { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply, tutorCandidates },
        ]);
        setStatus(statusFor(result.status));
        if (result.assistantReply) await playReply(result.assistantReply);
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      }
    },
    [sessionId, playReply, isStudent, candidatesForTurn],
  );

  const sendDocument = useCallback(
    async (file: File) => {
      if (!sessionId) return;
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: `📄 Shared "${file.name}"` }]);
      setStatus("thinking");
      setError(null);
      try {
        const res = isStudent ? await sendMentorMatchDocument(sessionId, file) : await sendCourseDraftDocument(sessionId, file);
        const result = res.data[0];
        if (!isStudent) setCourseTitle(result.draft?.course_title || null);
        if (result.matchedTutor) setMatchedTutor(result.matchedTutor);
        const tutorCandidates = isStudent ? candidatesForTurn(result.state) : undefined;
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: result.assistantReply, tutorCandidates }]);
        setStatus(statusFor(result.status));
        if (voiceModeRef.current && result.assistantReply) await playReply(result.assistantReply);
      } catch (e: any) {
        setError(e.message);
        setStatus("error");
      }
    },
    [sessionId, isStudent, playReply, candidatesForTurn],
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
    lastCandidateIdsRef.current = "";
  }, [sessionId, isStudent]);

  return {
    tutorName,
    matchedTutor,
    voiceMode,
    setVoiceMode,
    speakingLevel,
    playReply,
    stopSpeaking,
    sessionId,
    messages,
    status,
    courseTitle,
    isStarting,
    error,
    start,
    sendMessage,
    sendVoice,
    sendDocument,
    finalize,
    abandon,
  };
}
