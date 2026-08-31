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
import { getCookie } from "../utils/getCookie";

/**
 * Get the correct dashboard redirect path based on user role
 * Uses localStorage values set during login
 */
export function getRoleRedirectPath(): string {
  // Only run on client-side
  if (typeof window === "undefined") return "/auth";
  
  const role = localStorage.getItem("role");
  const org_name = localStorage.getItem("org_name");
  const type = localStorage.getItem("type")?.toLowerCase();
  
  // Admin check (highest priority)
  if (role === "goye_admin" || type === "admin") {
    return "/dashboard/admin";
  }
  
  // Organization admin
  if (role === "org_admin") {
    if (!org_name) return "/auth";
    return `/dashboard/${org_name}/admin`;
  }
  
  // Invited user (organization member)
  if (role === "invited_user" || type === "invited_user") {
    if (!org_name) return "/auth";
    return `/dashboard/${org_name}/organization`;
  }
  
  // Instructor/Tutor
  if (role === "instructor" || role === "tutor") {
    return "/dashboard/tutor";
  }
  
  // Default: Student
  if (role === "student") {
    return "/dashboard/student";
  }
  
  // Fallback for any other role or no role
  return "/auth";
}

/**
 * Get profile-specific redirect path (more granular)
 */
export function getProfileRedirectPath(): string {
  if (typeof window === "undefined") return "/auth";
  
  const role = localStorage.getItem("role");
  const org_name = localStorage.getItem("org_name");
  
  if (role === "student") {
    return "/dashboard/student/profile";
  } else if (role === "instructor" || role === "tutor") {
    return "/dashboard/tutor/profile";
  } else if (role === "invited_user") {
    return org_name ? `/dashboard/${org_name}/organization/profile` : "/auth";
  } else if (role === "org_admin") {
    return org_name ? `/dashboard/${org_name}/admin/profile` : "/auth";
  } else if (role === "goye_admin") {
    return "/dashboard/admin/profile";
  }
  
  return "/auth";
}

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Platform", href: "#platform" },
  { label: "Community", href: "#community" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Get the App", href: "#app" },
];

export default function LandingPageNavBar() {
  const [box, showBox] = useState<boolean>(false);
  const { darkMode, setDarkMode } = useTheme();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<string>("#home");
  const [scrolled, setScrolled] = useState(false);
  const [dashboardHref, setDashboardHref] = useState<string>("/auth");
  
  const { authStatus } = useAuthContext();
  const router = useRouter();
  
  // Check if user is signed in by checking for accessToken cookie
  const isSignedIn = !!getCookie("accessToken");

  // Update dashboard href when auth status changes or component mounts
  useEffect(() => {
    if (isSignedIn) {
      const path = getRoleRedirectPath();
      setDashboardHref(path);
    } else {
      setDashboardHref("/auth");
    }
  }, [isSignedIn, authStatus]);

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

  // Handle dashboard navigation with role-based routing
  const handleDashboardNavigation = () => {
    const path = getRoleRedirectPath();
    router.push(path);
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
              {link.label}
            </a>
          ))}
        </motion.nav>

        {/* Main Buttons (Desktop) */}
        <div className="hidden md:flex items-center md:flex-row flex-col md:justify-start justify-center gap-3 flex-shrink-0">
          <ToogleDarkMode toogleDarkMode={() => setDarkMode(!darkMode)} />
          {isSignedIn ? (
            <motion.button
              variants={itemVariants as any}
              className="nav_btn md:w-[160px] w-full md:bg-primaryColors-0 md:text-white text-primaryColors-0"
              onClick={handleDashboardNavigation}
            >
              Go to Dashboard
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
                Login
              </motion.button>
              <motion.button
                variants={itemVariants as any}
                className="nav_btn md:w-[93px] w-full md:bg-primaryColors-0 md:text-white text-primaryColors-0"
                onClick={() => {
                  router.push("/auth");
                }}
              >
                Signup
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
                    {link.label}
                  </a>
                ))}
                <div className="h-[1px] bg-[#ccc]/10 my-2" />
                {isSignedIn ? (
                  <button
                    className="nav_btn w-full bg-primaryColors-0 text-white"
                    onClick={handleDashboardNavigation}
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      className="nav_btn w-full border border-primaryColors-0 mb-2"
                      onClick={() => {
                        router.push("/auth");
                      }}
                    >
                      Login
                    </button>
                    <button
                      className="nav_btn w-full bg-primaryColors-0 text-white"
                      onClick={() => {
                        router.push("/auth");
                      }}
                    >
                      Signup
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