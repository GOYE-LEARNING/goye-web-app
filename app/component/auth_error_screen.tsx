"use client";

import { MdErrorOutline } from "react-icons/md";
import { useI18n } from "@/app/context/I18nContext";

interface Props {
  message: string;
  onRetry: () => void;
}

/**
 * Shown when an auth check couldn't get an answer from the server (network
 * drop, timeout, 5xx) — as opposed to the server explicitly rejecting the
 * session. Bouncing the user to /auth in that case reads as "you got signed
 * out" when nothing has actually invalidated their session; this keeps them
 * on the page and lets them retry instead.
 */
export default function AuthErrorScreen({ message, onRetry }: Props) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 dark:bg-secondaryColors-0 bg-white">
      <div className="max-w-sm w-full text-center">
        <MdErrorOutline className="mx-auto text-5xl text-red-500 mb-4" />
        <h1 className="font-bold text-[18px] dark:text-textSlightDark-0 text-lightBoldText-0 mb-2">
          {t("Something went wrong")}
        </h1>
        <p className="text-[14px] text-textGrey-0 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="w-full h-[44px] rounded-lg bg-primaryColors-0 text-white font-semibold"
        >
          {t("Try Again")}
        </button>
      </div>
    </div>
  );
}
