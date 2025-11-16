"use client";
import Image from "next/image";
import logo from "@/public/images/goye-removebg-preview.png";
import { usePathname } from "next/navigation";
export default function AuthWelcomeHeader() {
  const pathname = usePathname();
  return (
    <>
      <div className="px-[48px] flex justify-center items-center font-[400]  md:mb-7">
        <Image
          src={logo}
          alt="logo"
          height={100}
          width={100}
          className="hidden md:block"
        />
        {pathname == "/auth/welcome/auth" ? (
          ""
        ) : (
          <h1 className="font-semibold text-[16px] md:hidden block mt-[3rem]">
            Welcome to GOYE platform
          </h1>
        )}
      </div>
    </>
  );
}
