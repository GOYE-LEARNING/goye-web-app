"use client";

import { useEffect, useState } from "react";
import DashboardRadio from "./dashboard_radio";
import SubHeader from "./dashboard_subheader";
import { useI18n } from "@/app/context/I18nContext";

type SettingField =
  | "enable_push_notification"
  | "course_updates"
  | "event"
  | "achievement"
  | "daily_reminders"
  | "group_activity"
  | "email_notification";

interface NotificationSetting {
  header: string;
  field: SettingField;
  p: string;
}

interface Props {
  backFunction: () => void;
  settings?: NotificationSetting[];
  variant?: "student" | "admin" | "tutor";
}

const DEFAULT_SETTINGS: Record<string, NotificationSetting[]> = {
  student: [
    {
      header: "Enable Push Notifications",
      field: "enable_push_notification",
      p: "Receive notifications on your device",
    },
    {
      header: "Course Updates",
      field: "course_updates",
      p: "New lessons, completions, and assignments",
    },
    { header: "Events",
      field: "event", p: "Event reminders and live notifications" },
    { header: "Achievements",
      field: "achievement", p: "Badges, milestones, and progress updates" },
    {
      header: "Daily Reminders",
      field: "daily_reminders",
      p: "Get reminded to complete your daily study",
    },
    { header: "Group Activity",
      field: "group_activity", p: "Get updates from your groups" },
    { header: "Email Notifications",
      field: "email_notification", p: "Receive updates via email" },
  ],
  admin: [
    {
      header: "Enable Push Notifications",
      field: "enable_push_notification",
      p: "Receive notifications on your device",
    },
    {
      header: "Course Updates",
      field: "course_updates",
      p: "New lessons, completions, and assignments",
    },
    { header: "Events",
      field: "event", p: "Event reminders and live notifications" },
    { header: "Group Activity",
      field: "group_activity", p: "Get updates from your groups" },
    { header: "Email Notifications",
      field: "email_notification", p: "Receive updates via email" },
  ],
  tutor: [
    {
      header: "Enable Push Notifications",
      field: "enable_push_notification",
      p: "Receive notifications on your device",
    },
    {
      header: "Student Activity",
      field: "achievement",
      p: "Get notified when students join or complete courses",
    },
    { header: "Course Updates",
      field: "course_updates", p: "Changes to your courses" },
    { header: "Events",
      field: "event", p: "Event reminders and live notifications" },
    { header: "Group Activity",
      field: "group_activity", p: "Get updates from your groups" },
    { header: "Email Notifications",
      field: "email_notification", p: "Receive updates via email" },
  ],
};

export default function DashboardNotificationSettings({
  backFunction,
  settings,
  variant = "student",
}: Props) {
  const { t } = useI18n();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [saved, setSaved] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/settings`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.settings) setSaved(data.settings);
        else if (res.ok) setError("Notification settings are not set up for this account yet.");
        else setError(data.message || "Failed to load notification settings");
      } catch {
        setError("Failed to load notification settings");
      }
    })();
  }, [API_URL]);

  const toggle = async (field: SettingField, next: boolean) => {
    if (!saved?.id) return;
    const previous = saved;
    const updated = { ...saved, [field]: next };
    setSaved(updated);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/notifications/change-notification-settings/${saved.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            enable_push_notification: !!updated.enable_push_notification,
            course_updates: !!updated.course_updates,
            event: !!updated.event,
            achievement: !!updated.achievement,
            daily_reminders: !!updated.daily_reminders,
            group_activity: !!updated.group_activity,
            email_notification: !!updated.email_notification,
            darkMode: !!updated.darkMode,
          }),
        },
      );
      if (!res.ok) throw new Error();
    } catch {
      setSaved(previous);
      setError("Failed to update notification settings");
    } finally {
      setSaving(false);
    }
  };

  const backFunc = () => {
    backFunction();
  };

  const notificationSettings = settings || DEFAULT_SETTINGS[variant];
  const borderColor =
    variant === "admin" ? "border-[#ccc]/20" : "border-[#F1F1F1] dark:border-[#ccc]/10";

  return (
    <>
      <div>
        <SubHeader header={t("Notification")} backFunction={backFunc} />
        <div className="dashboard_content_mainbox flex flex-col gap-5">
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          {notificationSettings.map((setting, i) => (
            <div
              key={i}
              className={`flex items-center justify-between h-[63px] p-[16px] border ${borderColor}`}
            >
              <div>
                <h1 className="text-[14px] font-[600] dark:text-textSlightDark-0 text-lightBoldText-0">
                  {t(setting.header)}
                </h1>
                <p className="text-[#71748C] text-[12px]">{t(setting.p)}</p>
              </div>
              <DashboardRadio
                checked={!!saved?.[setting.field]}
                disabled={!saved?.id || saving}
                onChange={(next) => toggle(setting.field, next)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
