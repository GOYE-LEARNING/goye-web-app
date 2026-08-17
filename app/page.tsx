"use client";

import Footer from "./component/footer";
import HeroSection1 from "./component/hero_section1";
import HeroSection2 from "./component/hero_section2";
import HeroSection3 from "./component/hero_section3";
import HeroSection4 from "./component/hero_section4";
import HeroSection5 from "./component/hero_section5";

import LandingPageNavBar from "./component/landing_page_navbar";
import MidSection4 from "./component/hero_section_mid4";
import CookieConsent from "./component/cookie_consent";

export default function Home() {
  // The landing page is public, full stop. It previously ran an auth check
  // on mount and force-redirected any signed-in visitor to their dashboard,
  // which meant a logged-in user could never navigate *back* here — the
  // browser back button just bounced them forward again, trapping them.
  // Signed-in users now see the marketing page like anyone else; the navbar
  // swaps its Login/Signup pair for a "Go to Dashboard" link so getting back
  // is one deliberate click rather than a forced redirect.
  return (
    <>
      <div className="dark:bg-shadyColor-0 bg-white overflow-x-hidden scrollbar2">
        <LandingPageNavBar />
        <div>
          <HeroSection1 />
          <HeroSection2 />
          <HeroSection3 />
          <HeroSection4 />
          <MidSection4 />
        </div>

        <HeroSection5 />
        <Footer />
        <CookieConsent />
      </div>
    </>
  );
}
