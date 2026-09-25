"use client"

import { useI18n } from "@/app/context/I18nContext"

export default function AdminGetStudent () {
    const { t } = useI18n()
    return (
        <div>{t("Student")}</div>
    )
}