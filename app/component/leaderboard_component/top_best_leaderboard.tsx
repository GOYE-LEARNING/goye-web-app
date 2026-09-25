'use client'
import { useI18n } from "@/app/context/I18nContext";

export default function TopBestLeaderboard() {
    const { t } = useI18n();
    return (
        <div>
            <h1>{t("Top BestLeaderboard")}</h1>
        </div>
    )
}
