"use client";

import DashboardRadio from "./dashboard_radio";
import SubHeader from "./dashboard_subheader";

interface NotificationSetting {
  header: string;
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
      p: "Receive notifications on your device",
    },
    {
      header: "Course Updates",
      p: "New lessons, completions, and assignments",
    },
    { header: "Events", p: "Event reminders and live notifications" },
    { header: "Achievements", p: "Badges, milestones, and progress updates" },
    {
      header: "Daily Reminders",
      p: "Get reminded to complete your daily study",
    },
    { header: "Group Activity", p: "Get updates from your groups" },
    { header: "Email Notifications", p: "Receive updates via email" },
  ],
  admin: [
    {
      header: "Enable Push Notifications",
      p: "Receive notifications on your device",
    },
    {
      header: "Course Updates",
      p: "New lessons, completions, and assignments",
    },
    { header: "Events", p: "Event reminders and live notifications" },
    { header: "Group Activity", p: "Get updates from your groups" },
    { header: "Email Notifications", p: "Receive updates via email" },
  ],
  tutor: [
    {
      header: "Enable Push Notifications",
      p: "Receive notifications on your device",
    },
    {
      header: "Student Activity",
      p: "Get notified when students join or complete courses",
    },
    { header: "Course Updates", p: "Changes to your courses" },
    { header: "Events", p: "Event reminders and live notifications" },
    { header: "Group Activity", p: "Get updates from your groups" },
    { header: "Email Notifications", p: "Receive updates via email" },
  ],
};

export default function DashboardNotificationSettings({
  backFunction,
  settings,
  variant = "student",
}: Props) {
  const backFunc = () => {
    backFunction();
  };

  const notificationSettings = settings || DEFAULT_SETTINGS[variant];
  const borderColor =
    variant === "admin" ? "border-[#ccc]/20" : "border-[#F1F1F1] dark:border-[#ccc]/10";

  return (
    <>
      <div>
        <SubHeader header="Notification" backFunction={backFunc} />
        <div className="dashboard_content_mainbox flex flex-col gap-5">
          {notificationSettings.map((setting, i) => (
            <div
              key={i}
              className={`flex items-center justify-between h-[63px] p-[16px] border ${borderColor}`}
            >
              <div>
                <h1 className="text-[14px] font-[600] dark:text-textSlightDark-0 text-lightBoldText-0">
                  {setting.header}
                </h1>
                <p className="text-[#71748C] text-[12px]">{setting.p}</p>
              </div>
              <DashboardRadio />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
