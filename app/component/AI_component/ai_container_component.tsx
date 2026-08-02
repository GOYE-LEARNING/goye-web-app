"use client";

import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaMicrophone, FaPaperPlane, FaStop } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import ShekiAIOrb from "./ShekiAIOrb";
import { useShekiAI } from "@/app/hook/useShekiAI";

const QUICK_ACTIONS = [
  { label: "Create a course", prompt: "I'd like to create a new course. Can you help me plan it out?" },
  { label: "Give me ideas", prompt: "I'm not sure what to teach yet — can you suggest some course ideas?" },
  { label: "Add a quiz", prompt: "Let's add a quiz to test what students have learned." },
  { label: "Review my draft", prompt: "Can you show me what we've built so far?" },
];

export default function AIContainerComponent({ onClose }: { onClose?: () => void }) {
  const {
    tutorName,
    sessionId,
    messages,
    status,
    isStarting,
    error,
    start,
    sendMessage,
    sendVoice,
    finalize,
  } = useShekiAI();

  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [finalizedCourseId, setFinalizedCourseId] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isStarting) return;
    setInput("");
    await sendMessage(value);
  };

  const handleQuickAction = (prompt: string) => {
    if (!sessionId) {
      start(prompt);
    } else {
      handleSend(prompt);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendVoice(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      // Mic permission denied or unavailable — the tutor can still type.
    }
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      const courseId = await finalize();
      if (courseId) setFinalizedCourseId(courseId);
    } finally {
      setIsFinalizing(false);
    }
  };

  const showGreeting = messages.length === 0 && !sessionId;

  return (
    <div className="flex flex-col h-full w-full bg-lightSecondaryColor-0 dark:bg-shadyColor-0">
      {/* Header */}
      <div className="flex justify-between items-center w-full px-5 py-4 border-b border-black/5 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primaryYellow-0 to-primaryColors-0" />
          <span className="font-semibold text-lightBoldText-0 dark:text-textSlightDark-0">ShekiAI</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close assistant"
            className="h-8 w-8 bg-boldShadyColor-0/10 dark:bg-boldShadyColor-0 rounded-full flex justify-center items-center text-lightBoldText-0 dark:text-white hover:opacity-80"
          >
            <IoClose />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar2 px-5">
        {showGreeting ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 py-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-lightBoldText-0 dark:text-textSlightDark-0">
                Hello, {tutorName}!
              </h2>
              <p className="text-nearTextColors-0 dark:text-textGrey-0 mt-1">How can I help you today?</p>
            </div>

            <ShekiAIOrb status={status} size={130} />

            <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={isStarting}
                  className="text-sm px-3 py-2.5 rounded-xl bg-white dark:bg-boldShadyColor-0 text-lightBoldText-0 dark:text-textSlightDark-0 border border-black/5 dark:border-white/5 hover:border-primaryColors-0 transition-colors disabled:opacity-50"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="mr-2 shrink-0">
                    <ShekiAIOrb status="idle" size={28} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primaryColors-0 text-plainColors-0 rounded-br-sm"
                      : "bg-white dark:bg-boldShadyColor-0 text-lightBoldText-0 dark:text-textSlightDark-0 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {status === "thinking" && (
              <div className="flex items-center gap-2 text-nearTextColors-0 dark:text-textGrey-0 text-sm px-1">
                <ShekiAIOrb status="thinking" size={24} />
                <span>Thinking…</span>
              </div>
            )}

            {error && <div className="text-sm text-red-500 px-1">{error}</div>}

            {status === "awaiting_approval" && !finalizedCourseId && (
              <div className="bg-shadyYellow-0 border border-primaryYellow-0/40 rounded-xl p-3 flex items-center justify-between gap-3">
                <span className="text-sm text-lightBoldText-0 dark:text-textSlightDark-0">
                  Your draft is ready — want me to create the course?
                </span>
                <button
                  onClick={handleFinalize}
                  disabled={isFinalizing}
                  className="shrink-0 text-sm px-3 py-1.5 rounded-lg bg-primaryColors-0 text-white disabled:opacity-60"
                >
                  {isFinalizing ? "Creating…" : "Create it"}
                </button>
              </div>
            )}

            {finalizedCourseId && (
              <div className="bg-shadyGrreen-0 border border-boldGreen-0/40 rounded-xl p-3 text-sm text-lightBoldText-0 dark:text-textSlightDark-0">
                🎉 Course created! You can add lesson videos and materials from your course dashboard.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 p-4 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 bg-white dark:bg-boldShadyColor-0 rounded-full px-4 py-2 border border-black/5 dark:border-white/5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything…"
            className="flex-1 bg-transparent outline-none text-sm text-lightBoldText-0 dark:text-textSlightDark-0 placeholder:text-nearTextColors-0"
          />
          <AnimatePresence mode="wait">
            {input.trim() ? (
              <motion.button
                key="send"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                onClick={() => handleSend()}
                aria-label="Send message"
                className="h-8 w-8 rounded-full bg-primaryColors-0 text-white flex items-center justify-center shrink-0"
              >
                <FaPaperPlane size={13} />
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                onClick={toggleRecording}
                aria-label={isRecording ? "Stop recording" : "Record voice message"}
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  isRecording ? "bg-red-500 animate-pulse" : "bg-primaryColors-0"
                }`}
              >
                {isRecording ? <FaStop size={12} /> : <FaMicrophone size={13} />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
