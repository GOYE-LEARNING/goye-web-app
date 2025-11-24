import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

import pic1 from '@/public/images/logo2.png'
export default function Footer() {
  return (
    <>
      <div className="bg-[#11110D] py-[54px] md:px-[180px] px-[44px]">
        <div>
          <div className="flex justify-between items-center text-white">
            <h1 className="text-[20px] ">Learn More</h1>
            <div className="flex items-center gap-3 text-[25px]">
              <FaXTwitter />
              <FaFacebookF />
              <FaLinkedinIn />
              <FaInstagram />
            </div>
          </div>
          <div className="h-[1px] w-full bg-[#42433E] mt-[40px] mb-[60px]"></div>
          <div className="flex md:justify-between text-center md:text-left items-center md:flex-row flex-col">
            <Image src={pic1} height={80} width={80} alt="logo"/>
            <p className="text-[14px] text-white">© 2025 Disciple Training School. All Right Reserved</p>
          </div>
        </div>
      </div>
    </>
  );
}
