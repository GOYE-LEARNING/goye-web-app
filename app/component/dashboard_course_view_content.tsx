"use client";

import { useEffect, useState } from "react";
import DashboardSubHeaderMore from "./dashboard_subheaderMore";
import { FaAngleDown, FaAngleRight, FaVideo } from "react-icons/fa6";
import { FaAngleDoubleUp } from "react-icons/fa";
import { HiOutlineBookOpen } from "react-icons/hi";

interface Props {
  courseId: string;
  backFunc: () => void;
  editCourse: () => void;
  onDelete: (deleteCourse?: any) => void;
}

interface Course {
  id?: string;
  course_image: any;
  course_title: string;
  course_description: string;
  createdBy: string;
  course_duration: string;
  course_level: string;
  enrolled: string;
  quiz?: {
    title?: string;
    description?: string;
    duration?: string;
  };
  objectives: Obj[];
  module: Module[];
}

interface Obj {
  objective_title1: string;
  objective_title2: string;
  objective_title3: string;
  objective_title4: string;
  objective_title5: string;
}

interface Module {
  id: string;
  module_title: string;
  module_duration: string;
  module_description: string;
  lesson: Lesson[];
}

interface Lesson {
  lesson_title: string;
}

export default function DashboardCourseViewContent({
  courseId,
  backFunc,
  editCourse,
  onDelete,
}: Props) {
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("An error occurred while fetching courses");
      }
      console.log(data.data);
      setCourseDetails(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      if (onDelete) {
        await onDelete(courseId);
      } else {
        const res = await fetch(
          `${API_URL}/api/course/delete-course/${courseId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.log("An error occurred while deleting");
          return;
        }

        backFunc();

        console.log(
          `Course deleted successfully ID: ${courseId}, data: ${data}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(
      (prev) =>
        prev.includes(moduleId)
          ? prev.filter((id) => id !== moduleId) // Remove if already expanded
          : [...prev, moduleId] // Add if not expanded
    );
  };

  const toggleAllModules = () => {
    if (!courseDetails?.module) return;

    if (expandedModules.length === courseDetails.module.length) {
      // If all are expanded, collapse all
      setExpandedModules([]);
    } else {
      // Expand all modules
      const allModuleIds = courseDetails.module.map((module) => module.id);
      setExpandedModules(allModuleIds);
    }
  };

  const isModuleExpanded = (moduleId: string) => {
    return expandedModules.includes(moduleId);
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  return (
    <div>
      <DashboardSubHeaderMore
        deleteCourse={() => deleteCourse(courseDetails?.id as string)}
        editCourse={editCourse}
        backFunc={backFunc}
        header={courseDetails?.course_title as string}
        paragraph={
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 text-[14px]">
              <FaAngleDoubleUp color="#22c55e"/>
              <span className='text-green-500'>{courseDetails?.course_level}</span>
            </span>
            <span className="flex items-center gap-2 text-[14px] dark:text-lightWhite-0 text-lightBoldText-0/80">
              <FaVideo />
              <span>You have a lot of time to finish this course.</span>
            </span>
          </div>
        }
      />

      <div className="dashboard_content_mainbox">
        <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[16px]">
          Learning Objectives
        </h1>
        <ul className="px-[17px] my-3">
          {courseDetails?.objectives.map((obj, i) => (
            <div key={i}>
              <li className="cr_list">{obj.objective_title1}</li>
              <li className="cr_list">{obj.objective_title2}</li>
              <li className="cr_list">{obj.objective_title3}</li>
              <li className="cr_list">{obj.objective_title4}</li>
              <li className="cr_list">{obj.objective_title5}</li>
            </div>
          ))}
        </ul>
      </div>

      <div className="dashboard_content_mainbox">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0 text-[16px]">Modules</h1>
          {courseDetails?.module && courseDetails.module.length > 0 && (
            <button
              onClick={toggleAllModules}
              className="text-sm text-primaryColors-0 hover:text-secondaryColors-0 transition-colors"
            >
              {expandedModules.length === courseDetails.module.length
                ? "Collapse All"
                : "Expand All"}
            </button>
          )}
        </div>

        <div>
          {isLoading ? (
            <div className="text-center py-4">Loading modules...</div>
          ) : courseDetails?.module && courseDetails.module.length > 0 ? (
            courseDetails.module.map((module, index) => {
              const isExpanded = isModuleExpanded(module.id);

              return (
                <div
                  key={module.id}
                  className="border-b border-[#ccc]/20 mb-3 overflow-hidden"
                >
                  {/* Module Header - Clickable Area */}
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer dark:hover:bg-shadyColor-0 hover:bg-lightWhite-0 transition-colors"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold dark:text-textSlightDark-0 text-lightBoldText-0/80 text-[14px]">
                          {module.module_title}
                        </div>
                      </div>
                    </div>

                    {/* Chevron Button */}
                    <button
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent double trigger
                        toggleModule(module.id);
                      }}
                      aria-label={
                        isExpanded ? "Collapse module" : "Expand module"
                      }
                    >
                      {isExpanded ? (
                        <FaAngleDown className="text-gray-600" />
                      ) : (
                        <FaAngleRight className="text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 animate-fadeIn">
                      {/* Module Description */}
                      <p className="text-textGrey-0 text-[14px] mb-4">
                        {module.module_description}
                      </p>

                      {/* Lessons List */}
                      {module.lesson && module.lesson.length > 0 && (
                        <div className="space-y-2">
                          <span className="flex items-center gap-2 text-textGrey-0 text-[14px]">
                            <FaVideo /> 40 min to complete
                          </span>
                          <span className="flex items-center gap-2 text-textGrey-0 text-[14px]">
                            <HiOutlineBookOpen />{" "}
                            <div>{module.lesson.length} Videos</div>
                          </span>
                        </div>
                      )}

                      {/* If no lessons */}
                      {(!module.lesson || module.lesson.length === 0) && (
                        <div className="text-sm text-gray-500 italic">
                          No lessons added to this module yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No modules have been added to this course yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
