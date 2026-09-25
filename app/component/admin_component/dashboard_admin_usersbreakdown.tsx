"use client";

import { useI18n } from "@/app/context/I18nContext";

export default function DashboardAdminUserBreakdown() {
  const { t } = useI18n();
  return (
    <div className="dashboard_content_box">
      <h1 className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px]">
        {t("Users Breakdown")}
      </h1>
      <div className="flex flex-col gap-3 mt-2">
        <div className="admin_dashboard_data2">
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px]">190</h1>
            <span className="text-[#71748C] text-[12px]">{t("All Users")}</span>
          </div>
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px]">100</h1>
            <span className="text-[#71748C] text-[12px]">{t("Student")}</span>
          </div>

          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px]">90</h1>
            <span className="text-[#71748C] text-[12px]">{t("Instructors")}</span>
          </div>
        </div>

          <div className="admin_dashboard_data2">
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px]">590</h1>
            <span className="text-[#71748C] text-[12px]">{t("Beginners")}</span>
          </div>
          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px]">150</h1>
            <span className="text-[#71748C] text-[12px]">{t("Intermediate")}</span>
          </div>

          <div className="flex flex-col gap-1 items-center justify-center md:w-[206.3333282470703px] w-[100.66666412353516px]">
            <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[18px]">920</h1>
            <span className="text-[#71748C] text-[12px]">{t("Advanced")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
