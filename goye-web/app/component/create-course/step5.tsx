"use client";

import { AnimatePresence } from "framer-motion";
import React from "react";

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

interface Form {
  label: string;
  type?: string;
  name: string;
  value: string;
}

export default function CourseStep5({ formData, setFormData }: Props) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      objective: [{ ...prev.objective[0], [name]: value }],
    }));
  };

  const form: Form[] = [
    { label: "Objective 1", type: "text", name: "obj1", value: formData.objective?.[0]?.obj1 || "" },
    { label: "Objective 2", type: "text", name: "obj2", value: formData.objective?.[0]?.obj2 || "" },
    { label: "Objective 3", type: "text", name: "obj3", value: formData.objective?.[0]?.obj3 || "" },
    { label: "Objective 4", type: "text", name: "obj4", value: formData.objective?.[0]?.obj4 || "" },
    { label: "Objective 5", type: "text", name: "obj5", value: formData.objective?.[0]?.obj5 || "" },
  ];

  return (
    <div>
      <AnimatePresence mode="wait">
        <div key="course_objectives">
          <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
            Course Objectives
          </h1>
          <div className="my-5 flex flex-col gap-3">
            {form.map((item, i) => (
              <div
                key={i}
                className="border border-[#D2D5DA] flex flex-col w-full py-[8px] px-[12px]"
              >
                <label className="text-textGrey-0 text-[12px]">{item.label}</label>
                <input
                  type={item.type}
                  name={item.name}
                  value={item.value}
                  onChange={handleChange}
                  className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                />
              </div>
            ))}
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
}
