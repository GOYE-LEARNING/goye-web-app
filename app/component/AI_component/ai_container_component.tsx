"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MessagesModal from "@/app/component/MessagesModal";
import { IoClose, IoDocumentText } from "react-icons/io5";
import { FiChevronRight } from "react-icons/fi";
import { FaPaperPlane, FaPaperclip } from "react-icons/fa6";
import { MdOpenInFull, MdCloseFullscreen } from "react-icons/md";
import { FaUserGraduate } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ShekiAIOrb from "./ShekiAIOrb";
import { AssistantMode, TutorCandidate, useShekiAI } from "@/app/hook/useShekiAI";

// Reveals assistant text a chunk at a time rather than all at once, so a
// reply feels spoken rather than dumped on screen. Chunked (not per-char)
// so a long paragraph still finishes in roughly the same ~1.5s regardless
// of length, instead of a fixed per-character delay taking forever.
function TypingText({ text, onDone }: { text: string; onDone: () => void }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= text.length) {
      onDone();
      return;
    }
    const step = Math.max(1, Math.round(text.length / 60));
    const id = setTimeout(() => setShown((s) => Math.min(text.length, s + step)), 18);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, text]);

  return <>{text.slice(0, shown)}</>;
}

function TutorCandidateCards({
  candidates,
  onPick,
  onOpenCourse,
}: {
  candidates: TutorCandidate[];
  onPick: (tutor: TutorCandidate) => void;
  onOpenCourse: (courseId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 mt-1 max-w-[90%]">
      {candidates.map((tutor) => (
        <div
          key={tutor.id}
          className="rounded-xl border border-black/5 dark:border-white/5 bg-white dark:bg-boldShadyColor-0 p-3"
        >
          <button
            onClick={() => onPick(tutor)}
            className="w-full flex items-start gap-3 text-left"
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-primaryYellow-0 to-primaryColors-0 flex items-center justify-center text-white">
              <FaUserGraduate size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-lightBoldText-0 dark:text-textSlightDark-0 truncate">
                {tutor.name}
              </div>
              {tutor.church_role && (
                <div className="text-xs text-nearTextColors-0 dark:text-textGrey-0 truncate">{tutor.church_role}</div>
              )}
              {tutor.bio && (
                <p className="text-xs text-nearTextColors-0 dark:text-textGrey-0 mt-1 line-clamp-2">{tutor.bio}</p>
              )}
            </div>
          </button>
          {tutor.courses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 pl-12">
              {tutor.courses.slice(0, 3).map((course) => (
                <button
                  key={course.id}
                  onClick={() => onOpenCourse(course.id)}
                  className="text-[11px] px-2 py-1 rounded-full bg-primaryYellow-0/15 text-primaryColors-0 hover:bg-primaryYellow-0/25 transition-colors truncate max-w-[140px]"
                  title={course.title}
                >
                  {course.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

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
  const router = useRouter();
  // Once a message has fully typed out, it's marked done here so a re-render
  // (e.g. triggered by the next message arriving) shows it complete instead
  // of replaying the animation from scratch.
  const animatedIdsRef = useRef<Set<string>>(new Set());

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

  // Clicking a candidate doesn't fake a navigation — it asks the assistant
  // to actually propose the match, so the real propose_match tool call (and
  // the notification/chat it opens) still happens on the backend.
  const handlePickTutor = (tutor: TutorCandidate) => {
    sendMessage(`I'd like to connect with ${tutor.name}.`);
  };

  const handleOpenCourse = (courseId: string) => {
    router.push(`/dashboard/student/course?courseId=${courseId}`);
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
            {messages.map((m) => {
              const alreadyAnimated = animatedIdsRef.current.has(m.id);
              return (
                <div key={m.id} className="flex flex-col gap-1">
                  <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
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
                      {m.role === "assistant" && !alreadyAnimated ? (
                        <TypingText text={m.content} onDone={() => animatedIdsRef.current.add(m.id)} />
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>
                  {m.role === "assistant" && m.tutorCandidates && (
                    <div className="pl-9">
                      <TutorCandidateCards
                        candidates={m.tutorCandidates}
                        onPick={handlePickTutor}
                        onOpenCourse={handleOpenCourse}
                      />
                    </div>
                  )}
                </div>
              );
            })}

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
