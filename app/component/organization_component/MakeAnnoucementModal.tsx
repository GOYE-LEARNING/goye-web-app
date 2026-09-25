// components/org-admin/MakeAnnouncementModal.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  HiOutlineX,
  HiOutlineSpeakerphone,
  HiOutlineMail,
  HiOutlineUserGroup,
  HiOutlineGlobe,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle
} from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import Portal from "../Portal";
import { useI18n } from "@/app/context/I18nContext";

interface MakeAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName?: string;
  onSuccess?: () => void;
}

export default function MakeAnnouncementModal({
  isOpen,
  onClose,
  organizationName,
  onSuccess
}: MakeAnnouncementModalProps) {
  const { t } = useI18n();
  const params = useParams<{ org_name: string }>();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/organizations/announcements/${params.org_name}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, audience }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || t("Failed to create announcement"));
        return;
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setTitle("");
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error making announcement:", error);
      setError(t("An error occurred while creating the announcement"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Portal containerId="announcement-modal">
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white dark:bg-secondaryColors-0 rounded-xl max-w-lg w-full shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#ccc]/10 dark:border-[#ccc]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primaryColors-0/10 dark:bg-primaryColors-0/20 rounded-lg flex items-center justify-center">
                <HiOutlineSpeakerphone className="w-5 h-5 text-primaryColors-0 dark:text-primaryColors-0" />
              </div>
              <div>
                <h2 className="text-lg font-semibold dark:text-white">{t("Make an Announcement")}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {organizationName ? `${t("to")} ${organizationName}` : t('to your organization')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-shadyColor-0 rounded-lg transition-colors"
            >
              <HiOutlineX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <HiOutlineCheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold dark:text-white">{t("Announcement Sent!")}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("Your announcement has been sent to members.")}
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <HiOutlineExclamationCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Announcement Title")}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("Enter announcement title")}
                    className="w-full px-4 py-2 border border-[#ccc]/10 dark:border-[#ccc]/10 rounded-lg bg-lightWhite-0 dark:bg-shadyColor-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Message")}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("Write your announcement message...")}
                    rows={4}
                    className="w-full px-4 py-2 border border-[#ccc]/10 dark:border-[#ccc]/10 rounded-lg bg-lightWhite-0 dark:bg-shadyColor-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("Audience")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setAudience("all")}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                        audience === "all"
                          ? "border-primaryColors-0 bg-primaryColors-0/10 dark:bg-primaryColors-0/20"
                          : "border-[#ccc]/10 dark:border-[#ccc]/10 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <HiOutlineGlobe className={`w-5 h-5 ${
                        audience === "all" ? "text-primaryColors-0" : "text-gray-400"
                      }`} />
                      <span className={`text-xs ${
                        audience === "all" ? "text-primaryColors-0" : "text-gray-500 dark:text-gray-400"
                      }`}>{t("Everyone")}</span>
                    </button>
                    <button
                      onClick={() => setAudience("students")}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                        audience === "students"
                          ? "border-primaryColors-0 bg-primaryColors-0/10 dark:bg-primaryColors-0/20"
                          : "border-[#ccc]/10 dark:border-[#ccc]/10 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <HiOutlineUserGroup className={`w-5 h-5 ${
                        audience === "students" ? "text-primaryColors-0" : "text-gray-400"
                      }`} />
                      <span className={`text-xs ${
                        audience === "students" ? "text-primaryColors-0" : "text-gray-500 dark:text-gray-400"
                      }`}>{t("Students")}</span>
                    </button>
                    <button
                      onClick={() => setAudience("instructors")}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                        audience === "instructors"
                          ? "border-primaryColors-0 bg-primaryColors-0/10 dark:bg-primaryColors-0/20"
                          : "border-[#ccc]/10 dark:border-[#ccc]/10 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <HiOutlineMail className={`w-5 h-5 ${
                        audience === "instructors" ? "text-primaryColors-0" : "text-gray-400"
                      }`} />
                      <span className={`text-xs ${
                        audience === "instructors" ? "text-primaryColors-0" : "text-gray-500 dark:text-gray-400"
                      }`}>{t("Instructors")}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="flex justify-end gap-3 p-6 border-t border-[#ccc]/10 dark:border-[#ccc]/10 bg-lightWhite-0 dark:bg-shadyColor-0/50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-shadyColor-0 rounded-lg transition-colors"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !message.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <HiOutlineSpeakerphone className="w-5 h-5" />
                    <span>{t("Send Announcement")}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}