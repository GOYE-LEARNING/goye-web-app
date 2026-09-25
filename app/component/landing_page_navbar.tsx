"use client";

import pic from "@/public/images/goye_final_logo.png";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdClose, MdMenu } from "react-icons/md";
import ToogleDarkMode from "./toogleDarkMode";
import { useTheme } from "../context/theme_provider";
import { useAuthContext } from "../context/AuthContext";
import { useI18n } from "@/app/context/I18nContext";
import { getRoleRedirectPath, getProfileRedirectPath } from "@/app/utils/roleRedirect";
import InstallPwaPrompt from "./InstallPwaPrompt";

export { getRoleRedirectPath, getProfileRedirectPath };

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Platform", href: "#platform" },
  { label: "Community", href: "#community" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Get the App", href: "#app" },
];

export default function LandingPageNavBar() {
  const { t } = useI18n();
  const [box, showBox] = useState<boolean>(false);
  const { darkMode, setDarkMode } = useTheme();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<string>("#home");
  const [scrolled, setScrolled] = useState(false);
  const [dashboardHref, setDashboardHref] = useState<string>("/auth");
  const [isSignedIn, setIsSignedIn] = useState(false);

  const { checkPublicSession } = useAuthContext();
  const router = useRouter();

  // The old check here read document.cookie for "accessToken" — but that
  // cookie is set httpOnly by the backend, so JS can never actually see it,
  // and this silently always evaluated false. A real session check needs an
  // actual request; checkPublicSession() does that without ever redirecting
  // the visitor (an anonymous visitor on the marketing page is expected,
  // not an error).
  useEffect(() => {
    let cancelled = false;
    checkPublicSession().then(({ authenticated, redirectPath }) => {
      if (cancelled) return;
      setIsSignedIn(authenticated);
      setDashboardHref(authenticated && redirectPath ? redirectPath : "/auth");
    });
    return () => {
      cancelled = true;
    };
  }, [checkPublicSession]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const toggleDropdown = () => {
    showBox((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const removeDropdown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        showBox(false);
      }
    };
    document.addEventListener("mousedown", removeDropdown);
    return () => document.removeEventListener("mousedown", removeDropdown);
  }, []);

  // Lightweight scroll-spy — highlights whichever section is currently in view
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(
      (el): el is HTMLElement => !!el,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Transparent over the hero so the globe reads uninterrupted; a soft
  // blurred surface fades in once the page scrolls past it
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (href: string) => {
    showBox(false);
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle dashboard navigation — dashboardHref is set from the real
  // checkPublicSession() result above, not a localStorage guess.
  const handleDashboardNavigation = () => {
    router.push(dashboardHref);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        className={`fixed top-0 left-0 w-full py-[16px] px-[24px] md:py-[18px] md:px-[48px] gap-6 flex justify-between items-center z-40 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-md dark:bg-secondaryColors-0/70 bg-white/70 drop-shadow-sm"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <motion.div variants={itemVariants as any} className="flex-shrink-0">
          <a href="#home" onClick={(e) => { e.preventDefault(); goTo("#home"); }}>
            <Image src={pic} alt="logo" height={100} width={100} className="h-[42px] w-auto md:h-[48px]" />
          </a>
        </motion.div>

        {/* Section links (Desktop) */}
        <motion.nav
          variants={itemVariants as any}
          className="hidden lg:flex items-center gap-7"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                goTo(link.href);
              }}
              className={`text-[14px] font-medium transition-colors whitespace-nowrap ${
                activeSection === link.href
                  ? "text-primaryColors-0"
                  : "dark:text-textSlightDark-0 text-lightBoldText-0/60 hover:text-primaryColors-0"
              }`}
            >
              {t(link.label)}
            </a>
          ))}
        </motion.nav>

        {/* Main Buttons (Desktop) */}
        <div className="hidden md:flex items-center md:flex-row flex-col md:justify-start justify-center gap-3 flex-shrink-0">
          <InstallPwaPrompt />
          <ToogleDarkMode toogleDarkMode={() => setDarkMode(!darkMode)} />
          {isSignedIn ? (
            <motion.button
              variants={itemVariants as any}
              className="nav_btn md:w-[160px] w-full md:bg-primaryColors-0 md:text-white text-primaryColors-0"
              onClick={handleDashboardNavigation}
            >
              {t("Go to Dashboard")}
            </motion.button>
          ) : (
            <>
              <motion.button
                variants={itemVariants as any}
                className="nav_btn md:w-[93px] w-full md:border md:border-primaryColors-0 dark:text-white text-lightBoldText-0"
                onClick={() => {
                  router.push("/auth");
                }}
              >
                {t("Login")}
              </motion.button>
              <motion.button
                variants={itemVariants as any}
                className="nav_btn md:w-[93px] w-full md:bg-primaryColors-0 md:text-white text-primaryColors-0"
                onClick={() => {
                  router.push("/auth");
                }}
              >
                {t("Signup")}
              </motion.button>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="flex items-center justify-end md:hidden gap-2" ref={boxRef}>
          <ToogleDarkMode toogleDarkMode={() => setDarkMode(!darkMode)} />
          <div className="relative cursor-pointer" onClick={toggleDropdown}>
            {box ? <MdClose size={28} /> : <MdMenu size={28} />}

            {box && (
              <motion.div
                key="nav_btn"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute top-[calc(100%+16px)] right-0 dark:bg-secondaryColors-0 bg-white flex flex-col justify-center items-stretch w-[220px] py-4 px-4 drop-shadow-lg rounded-md gap-1"
              >
                <InstallPwaPrompt className="mb-2 self-center" />
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(link.href);
                    }}
                    className={`text-[15px] font-medium py-2 px-2 rounded ${
                      activeSection === link.href
                        ? "text-primaryColors-0"
                        : "dark:text-textSlightDark-0 text-lightBoldText-0/70"
                    }`}
                  >
                    {t(link.label)}
                  </a>
                ))}
                <div className="h-[1px] bg-[#ccc]/10 my-2" />
                {isSignedIn ? (
                  <button
                    className="nav_btn w-full bg-primaryColors-0 text-white"
                    onClick={handleDashboardNavigation}
                  >
                    {t("Go to Dashboard")}
                  </button>
                ) : (
                  <>
                    <button
                      className="nav_btn w-full border border-primaryColors-0 mb-2"
                      onClick={() => {
                        router.push("/auth");
                      }}
                    >
                      {t("Login")}
                    </button>
                    <button
                      className="nav_btn w-full bg-primaryColors-0 text-white"
                      onClick={() => {
                        router.push("/auth");
                      }}
                    >
                      {t("Signup")}
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}