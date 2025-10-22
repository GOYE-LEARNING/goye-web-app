"use client";

import Dashboard from "../dashboard/tutor/page";
import DashboardRadio from "./dashboard_radio";
import SubHeader from "./dashboard_subheader";
interface Props {
  backFunction: () => void;
}
export default function DashboardNotificationSettings({ backFunction }: Props) {
  const backFunc = () => {
    backFunction();
  };

  const settings = [
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
  ];
  return (
    <>
      <div>
        <SubHeader header="Notification" backFunction={backFunc} />
        <div className="dashboard_content_mainbox flex flex-col gap-5">
          {settings.map((settings, i) => (
            <div
              key={i}
              className="flex items-center justify-between h-[63px] p-[16px] border border-[#F1F1F1]"
            >
              <div>
                <h1 className="text-[14px] font-[600] text-[#1F2130]">
                  {settings.header}
                </h1>
                <p className="text-[#71748C] text-[12px]">{settings.p}</p>
              </div>
              <DashboardRadio />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
