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
import { CiUser } from "react-icons/ci";
import { FaAngleDoubleUp } from "react-icons/fa";
import { GoVideo } from "react-icons/go";
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

interface Course {
  course_title: string;
  course_level: string;
  course_image: string;
  course_description: string;
  createdBy: string;
  course_short_description: string;
  _count: number;
  module: Module[];
  duration: string;
}

interface Module {
  lesson: Lesson[];
}

interface Lesson {
  duration: any;
}
export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [search, setSearch] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
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

  const fetchCourses = async () => {
    const res = await fetch(`${API_URL}/api/course/get-all-courses`, {
      credentials: "include",
    });

    const data = await res.json();
    setCourses(data.data.getAllCourses);
  };

  const filterCourses = courses.filter(
    (c) =>
      c.course_title.toLowerCase().includes(search.toLowerCase()) ||
      c.course_description.toLowerCase().includes(search.toLowerCase()) ||
      c.course_short_description.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    fetchCourses();
  }, [search]);

  // Blank rather than a spinner — this check is a single fast local-cookie
  // round trip, and a spinner would just flash for most visitors.
  if (checkingSession) {
    return <div className="min-h-screen dark:bg-shadyColor-0 bg-white" />;
  }

  return (
    <>
      <div className="dark:bg-shadyColor-0 bg-white overflow-x-hidden overflow-y-hidden">
        <LandingPageNavBar
          search={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search === "" || search === null || search === undefined ? (
          <div>
            <HeroSection1 />
            <HeroSection2 />
            <HeroSection3 />
            <HeroSection4 />
            <MidSection4 />
          </div>
        ) : (
          <div className="flex justify-center items-center flex-col w-full my-10">
            <div className=" md:w-[1072px] w-full px-[40px]">
              <h1 className="text-[#9A9DAD]">
                Search result for:{" "}
                <span className="text-primaryColors-0 font-semibold">
                  {search}
                </span>
              </h1>
              <div className="bg-secondaryColors-0 md:p-[24px] p-[12px] my-3">
                {filterCourses.length == 0 ? (
                  <div className="">
                    <h1 className="text-nearTextColors-0 text-center text-[0.9rem]">
                      No course that matches your search is found here..
                    </h1>
                  </div>
                ) : (
                  <div className=" md:grid md:grid-cols-2 flex flex-col gap-7">
                    {filterCourses.map((c, i) => (
                      <div
                        key={i}
                        className="border border-[#D9D9D9]/10 md:p-[24px] p-[12px]"
                      >
                        <div className="flex items-start justify-start gap-3 mb-3">
                          <div className="h-[89.5px] w-[100.16px]">
                            <img
                              src={c.course_image}
                              alt="img"
                              className="h-full w-full"
                            />
                          </div>
                          <div className="flex flex-col gap-2 items-start w-full">
                            <div className="flex justify-between items-center w-full">
                              <h1 className="font-bold text-[#41415A] text-[14px] line-clamp-1">
                                {c.course_title}
                              </h1>
                              <p className="text-white bg-shadyColor-0 uppercase px-2 text-[10px] font-semibold">
                                Available
                              </p>
                            </div>
                            <div>
                              <p className="text-[#71748C] text-[14px] line-clamp-1">
                                {c.course_description}
                              </p>
                            </div>
                            <div className="w-full flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <CiUser color="#71748C" />
                                <p className="text-[#71748C] text-[0.9rem]">
                                  Pst {c.createdBy}
                                </p>
                              </span>
                              <span className="flex items-center gap-1">
                                <FaAngleDoubleUp color="#30A46F" />
                                <p className="text-[#30A46F] text-[12px] capitalize">
                                  {c.course_level}
                                </p>
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GoVideo color="#71748C" />
                              <span className="text-[#71748C] text-[0.8rem]">
                                {c.module.map((m) =>
                                  m.lesson.map((l) => l.duration),
                                )}{" "}
                                - {c.module.map((m) => m.lesson.length)} Lessons
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          className="border border-[#FFA50080] text-primaryColors-0 h-[36px] w-full font-semibold text-[14px]"
                          onClick={() => {
                            router.push("/auth");
                          }}
                        >
                          Enroll Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <HeroSection5 />
        <Footer />
      </div>
    </>
  );
}
