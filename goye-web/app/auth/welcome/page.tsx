"use client";

import AuthWelcomeHeader from "@/app/component/auth_welcome_header";

import Image from "next/image";
import pic1 from "@/public/images/pic1.png";
import pic2 from "@/public/images/pic2.png";
import pic3 from "@/public/images/pic3.png";
import pic4 from "@/public/images/pic4.png";
import pic5 from "@/public/images/pic5.png";
import pic6 from "@/public/images/pic6.png";
import pic7 from "@/public/images/pic7.png";

export default function WelcomeAuth() {
  const pics = [
    { pic: pic1 },
    { pic: pic2 },
    { pic: pic3 },
    { pic: pic4 },
    { pic: pic5 },
    { pic: pic6 },
    { pic: pic7 },
  ];
  return (
    <>
  
      <div className="flex justify-center items-center flex-col">
        <div className="form_container">
          <h1 className="form_h1 text-center">
            Welcome to your new <br /> experience.
          </h1>
          <p className="form_p text-center my-7">Grow deeper, walk stronger.</p>
          <div className="flex justify-center items-center flex-col my-5">
            <div className="w-[390px] h-[1px] bg-[#D9D9D9]"></div>

            <div className="w-[80%] flex flex-wrap gap-4 justify-center mt-8">
              {pics.map((pic, i) => (
                <div
                  key={i}
                  className="bg-secondaryColors-0 h-[74.51px] w-[74.51px] rounded-full flex justify-center items-center overflow-hidden"
                ><Image src={pic.pic} alt="pics" className="h-[74.51px] w-[74.51px] object-cover"/></div>
              ))}
            </div>
          </div>
          <span className="form_btn ">Continue</span>
        </div>
      </div>
    </>
  );
}
