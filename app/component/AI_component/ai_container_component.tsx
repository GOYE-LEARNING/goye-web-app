"use client";

import { useEffect, useRef, useState } from "react";
import MessagesModal from "@/app/component/MessagesModal";
import { IoClose, IoDocumentText } from "react-icons/io5";
import { FiChevronRight } from "react-icons/fi";
import { FaPaperPlane, FaPaperclip } from "react-icons/fa6";
import { MdOpenInFull, MdCloseFullscreen } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import ShekiAIOrb from "./ShekiAIOrb";
import { AssistantMode, useShekiAI } from "@/app/hook/useShekiAI";

const TUTOR_QUICK_ACTIONS = [
  { label: "Create a course", prompt: "I'd like to create a new course. Can you help me plan it out?" },
  { label: "Give me ideas", prompt: "I'm not sure what to teach yet — can you suggest some course ideas?" },
  { label: "Add a quiz", prompt: "Let's add a quiz to test what students have learned." },
  { label: "Review my draft", prompt: "Can you show me what we've built so far?" },
];

const STUDENT_QUICK_ACTIONS = [
  { label: "Find me a mentor", prompt: "I'd like to find a mentor who can guide me." },
  { label: "Help me grow spiritually", prompt: "I want to grow spiritually — can you connect me with someone who can help?" },
  { label: "I'm struggling with something", prompt: "I'm struggling with something and could use someone to talk to and learn from." },
  { label: "Learn a new skill", prompt: "I want to learn a new skill — who on GOYE could teach me?" },
];

export default function AIContainerComponent({
  onClose,
  mode = "tutor",
  closeVariant = "close",
  isExpanded,
  onToggleExpand,
}: {
  onClose?: () => void;
  mode?: AssistantMode;
  // On desktop the panel collapses to a rail rather than disappearing, so
  // a chevron reads more honestly there than an X.
  closeVariant?: "close" | "collapse";
  isExpanded?: boolean;
  onToggleExpand?: (next: boolean) => void;
}) {
  const isStudent = mode === "student";
  const QUICK_ACTIONS = isStudent ? STUDENT_QUICK_ACTIONS : TUTOR_QUICK_ACTIONS;
  const {
    tutorName,
    matchedTutor,
    sessionId,
    messages,
    status,
    isStarting,
    error,
    start,
    sendMessage,
    sendDocument,
    finalize,
  } = useShekiAI(mode);

  const [input, setInput] = useState("");
  // Chosen but not yet sent — shown as a chip above the input so a tutor/
  // student can see (and remove) what they're about to share before it
  // actually goes anywhere, instead of it firing off the moment they pick it.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [finalizedCourseId, setFinalizedCourseId] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const value = input.trim();
    if (isStarting || isUploadingDoc) return;

    if (pendingFile) {
      const file = pendingFile;
      setPendingFile(null);
      setInput("");
      setIsUploadingDoc(true);
      try {
        await sendDocument(file);
        // A caption typed alongside the file is sent as its own follow-up
        // turn — keeps the document-extraction endpoint single-purpose
        // rather than needing to also accept free text.
        if (value) await sendMessage(value);
      } finally {
        setIsUploadingDoc(false);
      }
      return;
    }

    if (!value) return;
    setInput("");
    await sendMessage(value);
  };

  const handleQuickAction = (prompt: string) => {
    if (!sessionId) start(prompt);
    else sendMessage(prompt);
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
        <div className="flex items-center gap-2">
          {onToggleExpand && (
            <button
              onClick={() => onToggleExpand(!isExpanded)}
              aria-label={isExpanded ? "Exit full screen" : "Expand to full screen"}
              className="h-8 w-8 bg-boldShadyColor-0/10 dark:bg-boldShadyColor-0 rounded-full flex justify-center items-center text-lightBoldText-0 dark:text-white hover:opacity-80"
            >
              {isExpanded ? <MdCloseFullscreen size={14} /> : <MdOpenInFull size={14} />}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              aria-label={closeVariant === "collapse" ? "Collapse assistant" : "Close assistant"}
              className="h-8 w-8 bg-boldShadyColor-0/10 dark:bg-boldShadyColor-0 rounded-full flex justify-center items-center text-lightBoldText-0 dark:text-white hover:opacity-80"
            >
              {closeVariant === "collapse" ? <FiChevronRight size={15} /> : <IoClose />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar2 px-5">
        {showGreeting ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 py-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-lightBoldText-0 dark:text-textSlightDark-0">
                Hello, {tutorName}!
              </h2>
              <p className="text-nearTextColors-0 dark:text-textGrey-0 mt-1">
                {isStudent ? "Looking for a mentor? Let's find the right person." : "How can I help you today?"}
              </p>
            </div>

            <ShekiAIOrb status={status} size={isExpanded ? 190 : 130} />

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

            {(status === "thinking" || isUploadingDoc) && (
              <div className="flex items-center gap-2 text-nearTextColors-0 dark:text-textGrey-0 text-sm px-1">
                <ShekiAIOrb status="thinking" size={24} />
                <span>{isUploadingDoc ? "Reading your document…" : "Thinking…"}</span>
              </div>
            )}

            {error && <div className="text-sm text-red-500 px-1">{error}</div>}

            {!isStudent && status === "awaiting_approval" && !finalizedCourseId && (
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

            {isStudent && matchedTutor && (
              <div className="bg-shadyGrreen-0 border border-boldGreen-0/40 rounded-xl p-3 flex items-center justify-between gap-3">
                <span className="text-sm text-lightBoldText-0 dark:text-textSlightDark-0">
                  🎉 {matchedTutor.name} has been notified — your chat is ready.
                </span>
                <button
                  onClick={() => setShowMessages(true)}
                  className="shrink-0 text-sm px-3 py-1.5 rounded-lg bg-primaryColors-0 text-white"
                >
                  Open chat
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 p-4 border-t border-black/5 dark:border-white/5">
        {pendingFile && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-white dark:bg-boldShadyColor-0 border border-black/5 dark:border-white/5">
            <IoDocumentText className="text-primaryColors-0 shrink-0" size={16} />
            <span className="text-sm text-lightBoldText-0 dark:text-textSlightDark-0 truncate flex-1">{pendingFile.name}</span>
            <button
              onClick={() => setPendingFile(null)}
              aria-label="Remove attached document"
              className="shrink-0 text-nearTextColors-0 hover:text-red-500"
            >
              <IoClose size={16} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-white dark:bg-boldShadyColor-0 rounded-full px-3 py-2 border border-black/5 dark:border-white/5">
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach a document"
            disabled={!sessionId || isUploadingDoc}
            className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-nearTextColors-0 hover:text-primaryColors-0 disabled:opacity-40"
          >
            <FaPaperclip size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPendingFile(file);
              e.target.value = "";
            }}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={pendingFile ? "Say something about this file (optional)…" : "Ask me anything…"}
            disabled={isUploadingDoc}
            className="flex-1 bg-transparent outline-none text-sm text-lightBoldText-0 dark:text-textSlightDark-0 placeholder:text-nearTextColors-0 disabled:opacity-50"
          />
          <AnimatePresence>
            {(input.trim() || pendingFile) && (
              <motion.button
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                onClick={handleSend}
                disabled={isUploadingDoc}
                aria-label="Send message"
                className="h-8 w-8 rounded-full bg-primaryColors-0 text-white flex items-center justify-center shrink-0 disabled:opacity-60"
              >
                <FaPaperPlane size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reuses GOYE's existing messaging UI rather than routing to
          /dashboard/student/chat, which isn't a real route (the dashboard
          header links to it, but no such page exists). */}
      <MessagesModal isOpen={showMessages} onClose={() => setShowMessages(false)} />
    </div>
  );
}
