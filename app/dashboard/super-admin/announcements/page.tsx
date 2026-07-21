"use client";

import { useState } from "react";
import {
  HiOutlineSpeakerphone,
  HiOutlineMail,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";

type Audience = "all" | "students" | "tutors" | "org_admins";
type Mode = "announcement" | "email";

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "students", label: "Students" },
  { value: "tutors", label: "Tutors" },
  { value: "org_admins", label: "Org Admins" },
];

export default function SuperAdminAnnouncements() {
  const [mode, setMode] = useState<Mode>("announcement");
  const [audience, setAudience] = useState<Audience>("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const reset = () => {
    setTitle("");
    setMessage("");
  };

  const handleSend = async () => {
    setResult(null);
    if (!title.trim() || !message.trim()) {
      setResult({ ok: false, text: mode === "email" ? "Subject and message are required." : "Title and message are required." });
      return;
    }
    if (!API_URL) {
      setResult({ ok: false, text: "API URL not configured." });
      return;
    }

    const confirmText =
      mode === "email"
        ? `Send this email to ${AUDIENCES.find((a) => a.value === audience)?.label}? This delivers real email.`
        : `Post this in-app announcement to ${AUDIENCES.find((a) => a.value === audience)?.label}?`;
    if (!confirm(confirmText)) return;

    setIsSending(true);
    try {
      const endpoint = mode === "email" ? "/api/super-admin/email" : "/api/super-admin/announcements";
      const payload =
        mode === "email"
          ? { subject: title, message, audience }
          : { title, message, audience };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ ok: true, text: data.message || "Sent successfully." });
        reset();
      } else {
        setResult({ ok: false, text: data.message || "Failed to send." });
      }
    } catch (err) {
      console.error("Error sending:", err);
      setResult({ ok: false, text: "We couldn't reach the server. Please try again." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto">
      <h1 className="dashboard_h1">Announcements & Email</h1>
      <p className="text-textGrey-0 text-[13px] mb-4">
        Broadcast an in-app announcement or send email to the whole platform.
      </p>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#ccc]/10 rounded-xl mb-5">
        <button
          onClick={() => { setMode("announcement"); setResult(null); }}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-[600] transition-colors ${
            mode === "announcement" ? "bg-white dark:bg-shadyColor-0 text-primaryColors-0 shadow-sm" : "text-textGrey-0"
          }`}
        >
          <HiOutlineSpeakerphone /> In-App Announcement
        </button>
        <button
          onClick={() => { setMode("email"); setResult(null); }}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-[600] transition-colors ${
            mode === "email" ? "bg-white dark:bg-shadyColor-0 text-primaryColors-0 shadow-sm" : "text-textGrey-0"
          }`}
        >
          <HiOutlineMail /> Email Broadcast
        </button>
      </div>

      <div className="bg-white dark:bg-shadyColor-0 rounded-xl border border-[#ccc]/10 p-5">
        {result && (
          <div className={`flex items-start gap-2 p-3 rounded-lg mb-4 ${result.ok ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
            {result.ok ? <HiOutlineCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" /> : <HiOutlineExclamationCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />}
            <p className={`text-[13px] ${result.ok ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{result.text}</p>
          </div>
        )}

        {/* Audience */}
        <label className="block text-[13px] font-[600] text-textSlightDark-0 dark:text-white mb-2">Audience</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {AUDIENCES.map((a) => (
            <button
              key={a.value}
              onClick={() => setAudience(a.value)}
              className={`py-2 rounded-lg text-[12px] font-[500] border transition-colors ${
                audience === a.value
                  ? "border-primaryColors-0 bg-primaryColors-0/10 text-primaryColors-0"
                  : "border-[#ccc]/20 text-textGrey-0 hover:border-[#ccc]/40"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Title / subject */}
        <label className="block text-[13px] font-[600] text-textSlightDark-0 dark:text-white mb-1">
          {mode === "email" ? "Subject" : "Title"}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={mode === "email" ? "Email subject line" : "Announcement title"}
          className="w-full px-4 py-2 border border-[#ccc]/20 rounded-lg bg-lightWhite-0 dark:bg-secondaryColors-0 text-textSlightDark-0 dark:text-white text-sm mb-4 outline-none focus:border-primaryColors-0"
        />

        {/* Message */}
        <label className="block text-[13px] font-[600] text-textSlightDark-0 dark:text-white mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Write your message..."
          className="w-full px-4 py-2 border border-[#ccc]/20 rounded-lg bg-lightWhite-0 dark:bg-secondaryColors-0 text-textSlightDark-0 dark:text-white text-sm mb-4 outline-none focus:border-primaryColors-0 resize-none"
        />

        <button
          onClick={handleSend}
          disabled={isSending}
          className="w-full py-3 rounded-xl bg-primaryColors-0 text-white font-[600] text-[14px] hover:bg-primaryColors-0/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSending ? (
            <><FaSpinner className="animate-spin" /> Sending...</>
          ) : mode === "email" ? (
            <><HiOutlineMail /> Send Email</>
          ) : (
            <><HiOutlineSpeakerphone /> Post Announcement</>
          )}
        </button>
      </div>
    </div>
  );
}
