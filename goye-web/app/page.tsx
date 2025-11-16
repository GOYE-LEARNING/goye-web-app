"use client";

import Footer from "./component/footer";
import HeroSection1 from "./component/hero_section1";
import HeroSection2 from "./component/hero_section2";
import HeroSection3 from "./component/hero_section3";
import HeroSection4 from "./component/hero_section4";
import HeroSection5 from "./component/hero_section5";

import LandingPageNavBar from "./component/landing_page_navbar";

export default function Home() {
  return (
    <>
      <div className="bg-shadyColor-0">
        <LandingPageNavBar />
        <HeroSection1 />
        <HeroSection2 />
        <HeroSection3 />
        <HeroSection4 />
        <HeroSection5 />
        <Footer />
      </div>
    </>
  );
}
