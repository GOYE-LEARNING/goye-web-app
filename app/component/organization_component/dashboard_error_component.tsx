"use client";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
    message: string;
    status: string;
    cancelFunc?: () => void;
}
export default function ErrorComponent({message, status, cancelFunc} : Props) {
    const { t } = useI18n();
    return (
        <div className="bg-slate-900 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">{t("Error: ")}</strong>
            <span className="block sm:inline">{message}</span>
            <div className="absolute top-2 right-2 font-extrabold text-2xl cursor-pointer" onClick={cancelFunc}>&times;</div>
        </div>
    )
}