"use client";

import { useState } from "react";
import { HiOutlineBookOpen, HiOutlineUserGroup, HiOutlineChatAlt2, HiX } from "react-icons/hi";

type FeedbackType = "COURSE" | "GROUP" | "OTHER";

const TYPES: { key: FeedbackType; label: string; icon: React.ReactNode }[] = [
  { key: "COURSE", label: "A Course", icon: <HiOutlineBookOpen /> },
  { key: "GROUP", label: "A Group", icon: <HiOutlineUserGroup /> },
  { key: "OTHER", label: "Something Else", icon: <HiOutlineChatAlt2 /> },
];

interface Props {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: Props) {
  const [type, setType] = useState<FeedbackType>("OTHER");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Please enter a message before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await fetch(`${API_URL}/api/feedback/feedback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send feedback");
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Could not send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {sent ? "Thank you!" : "Send Feedback"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <HiX size={20} />
          </button>
        </div>

        {sent ? (
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your feedback has been sent. We appreciate you taking the time.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-lg bg-primaryColors-0 text-white py-2 text-sm font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">What is this about?</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {TYPES.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setType(opt.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    type === opt.key
                      ? "bg-primaryColors-0 border-primaryColors-0 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Your feedback</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind…"
              rows={5}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primaryColors-0/50 resize-none"
            />

            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 w-full rounded-lg bg-primaryColors-0 text-white py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Submit Feedback"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
