"use client";

import { useEffect, useState } from "react";
import Footer from "./component/footer";
import HeroSection1 from "./component/hero_section1";
import HeroSection2 from "./component/hero_section2";
import HeroSection3 from "./component/hero_section3";
import HeroSection4 from "./component/hero_section4";
import HeroSection5 from "./component/hero_section5";

import LandingPageNavBar from "./component/landing_page_navbar";
import MidSection4 from "./component/hero_section_mid4";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./context/AuthContext";

// Where a returning, already-authenticated visitor lands instead of the
// marketing page. Coarser than the per-role /profile paths in
// hook/getRole.tsx on purpose — "take me to my dashboard" means the actual
// dashboard home, not a specific subpage. Mirrors AuthContext's own
// (unexported) getUserType() classification rather than importing it, since
// that helper isn't part of the context's public surface.
function dashboardHomeForUser(user: { role?: string; type?: string; userType?: string } | undefined): string {
  const type = (localStorage.getItem("type") || user?.type || "").toLowerCase();
  const role = localStorage.getItem("role") || user?.role;
  const userType = user?.userType;

  if (type === "admin" || role === "goye_admin") {
    return "/dashboard/admin";
  }

  if (
    type === "organization" ||
    type === "invited_user" ||
    userType === "INVITED_MEMBER" ||
    userType === "ORGANIZATION_OWNER" ||
    role === "org_admin"
  ) {
    const orgName = localStorage.getItem("org_name");
    if (!orgName) return "/auth";
    return role === "org_admin" ? `/dashboard/${orgName}/admin` : `/dashboard/${orgName}/organization`;
  }

  return role === "instructor" || role === "tutor" ? "/dashboard/tutor" : "/dashboard/student";
}

export default function Home() {
  const router = useRouter();
  const { checkAuth, authStatus } = useAuthContext();

  // A returning, already-signed-in visitor should never see the marketing
  // page — send them straight to their dashboard. Only a genuine newcomer
  // (checkAuth resolves false) sees the landing page below. Held behind
  // "checking" so the page doesn't flash the marketing content for a
  // returning visitor before the redirect fires.
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    checkAuth().then((isExistingUser) => {
      if (cancelled) return;
      if (isExistingUser) {
        router.replace(dashboardHomeForUser(authStatus.user));
      } else {
        setCheckingSession(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount — checkAuth/authStatus are stable
    // enough for a one-shot "am I already logged in?" check, and re-running
    // this on every authStatus change would refire the redirect decision
    // mid-session for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Blank rather than a spinner — this check is a single fast local-cookie
  // round trip, and a spinner would just flash for most visitors.
  if (checkingSession) {
    return <div className="min-h-screen dark:bg-shadyColor-0 bg-white" />;
  }

  return (
    <>
      <div className="dark:bg-shadyColor-0 bg-white overflow-x-hidden overflow-y-hidden">
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
      </div>
    </>
  );
}
