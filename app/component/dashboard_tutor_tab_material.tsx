"use client";

import { useEffect, useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { GoDownload } from "react-icons/go";
import { HiOutlineBookOpen } from "react-icons/hi";
import Loader from "./loader";
interface Props {
  courseId: string;
}

interface Material {
  material_title: string;
  material_description: string;
  material_pages: number;
  material_document: string;
}


export default function DashboardTutorTabMaterial({ courseId }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${API_URL}/api/course/get-course/${courseId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!res.ok) {
          console.log("An error occured while fetching courses");
        }
        console.log(data.data);
        setIsLoading(false);
        setMaterials(data.data.material);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, []);
  return (
    <div>
      <div className="dashboard_content_mainbox">
        <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0text-[18px] font-bold">All Materials</h1>
        {!isLoading ? (
          <div>
            {" "}
            {materials.map((m, i) => (
              <div key={i} className="flex flex-col gap-2 my-5">
                <h1 className="text-[16px] dark:text-textSlightDark-0 text-lightBoldText-0 font-[600]">
                  {m.material_title}
                </h1>
                <p className="dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px]">
               {m.material_description}
                </p>
                <p className="flex gap-4 dark:text-textSlightDark-0 text-lightBoldText-0 text-[14px]">
                  <span className="flex items-center gap-2">
                    <FaRegFileAlt />
                    3.1 MB{" "}
                  </span>
                  <span className="flex items-center gap-2">
                    <HiOutlineBookOpen /> {m.material_pages} Pages
                  </span>
                </p>
                <button className="form_more bg-lightWhite-0 dark:bg-shadyColor-0 text-primaryColors-0 border border-[#ccc]/10 font-semibold flex justify-center items-center">
                  <GoDownload /> Download
                </button>
                <div className="dashboard_hr my-5"></div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <Loader
              height={30}
              width={30}
              full_border_color="transparent"
              border_width={3}
              small_border_color="#49151B"
            />
          </div>
        )}
      </div>
    </div>
  );
}
