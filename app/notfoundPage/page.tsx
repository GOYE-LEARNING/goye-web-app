"use client";
import notfound from "@/public/images/404.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function DashboardPageNotFound() {
  const router = useRouter();
  return (
    <div className="flex justify-center items-center flex-col gap-4">
      <Image
        src={notfound}
        alt="404 Not Found"
        className="w-[35%] h-auto object-contain"
      />
      <h1 className="text-2xl font-bold text-gray-800 text-center inline">
        Oops turns out this organization doesn't exist.
      </h1>
      <button
        className="bg-black hover:bg-black/50 text-white font-bold py-4 px-7 rounded"
        onClick={() => router.push("../auth/")}
      >
        Go back to login
      </button>
    </div>
  );
}
