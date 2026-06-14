"use client";

import { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { PiSpeakerSimpleNoneFill } from "react-icons/pi";

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

  return (
    <div className="dark:bg-[#30A46F1A]/10 bg-shadyGrreen-0/10 backdrop-blur-md p-[16px] space-y-4">
      {announcements.slice(0, 1).map((announcement) => (
        <div key={announcement.id}>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center">
              <PiSpeakerSimpleNoneFill color="#30A46F" />
              <h1 className="text-[12px] ml-1">Announcement</h1>
            </div>
            {/* Cancel button always visible */}
            <span onClick={backFunc} className="cursor-pointer">
              <MdOutlineCancel size={19} />
            </span>
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