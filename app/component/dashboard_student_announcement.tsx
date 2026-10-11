"use client";

import { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { PiSpeakerSimpleNoneFill } from "react-icons/pi";
import { useI18n } from "../context/I18nContext";

interface Props {
  backFunc: () => void;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function DashboardStudentAnnouncement({ backFunc }: Props) {
  const { t } = useI18n();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications/fetch-annocucment-by-admin`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        console.log(data);
        
        if (data.data && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        } else if (Array.isArray(data)) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      }
    };

    fetchAnnouncements();
  }, [API_URL]);

  // Cancel: hide it right away, then mark it read on the server so it does not
  // come back on the next visit or on another device.
  const dismiss = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
    } catch (error) {
      console.error("Failed to dismiss announcement:", error);
    }
    backFunc();
  };

  if (announcements.length === 0) return null;

  return (
    <div className="dark:bg-[#30A46F1A]/10 bg-shadyGrreen-0/10 backdrop-blur-md p-[16px] space-y-4">
      {announcements.slice(0, 1).map((announcement) => (
        <div key={announcement.id}>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center">
              <PiSpeakerSimpleNoneFill color="#30A46F" />
              <h1 className="text-[12px] ml-1">{t("Announcement")}</h1>
            </div>
            <button
              type="button"
              aria-label="Dismiss announcement"
              onClick={() => dismiss(announcement.id)}
              className="cursor-pointer"
            >
              <MdOutlineCancel size={19} />
            </button>
          </div>
          <div>
            <h1 className="font-[700] mt-3">{announcement.title}</h1>
            <p className="text-[#41415A] dark:text-white/80">
              {announcement.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}