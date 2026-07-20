"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MdRefresh, MdHome } from "react-icons/md";
import logo from "@/public/images/goye_final_logo.png";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-white dark:bg-secondaryColors-0 px-4">
      <div className="max-w-md w-full text-center">
        <Image
          src={logo}
          alt="GOYE"
          className="h-10 w-auto mx-auto mb-8 opacity-90"
        />

        <div className="w-20 h-20 rounded-full bg-primaryColors-0/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🙏</span>
        </div>

        <h1 className="text-2xl font-bold text-lightBoldText-0 dark:text-textSlightDark-0 mb-3">
          This isn't the end of the story
        </h1>
        <p className="text-textGrey-0 text-[15px] mb-8 leading-relaxed">
          Something unexpected happened on our end. Take a breath — nothing
          you were working on is lost. Let's try that again.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primaryColors-0 text-plainColors-0 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <MdRefresh /> Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-lightWhite-0 dark:bg-shadyColor-0 text-lightBoldText-0 dark:text-textSlightDark-0 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <MdHome /> Go Home
          </button>
        </div>

        <p className="text-textGrey-0 text-xs mt-10">
          If this keeps happening, our team is one message away — reach out
          and we'll sort it out together.
        </p>
      </div>
    </div>
  );
}
