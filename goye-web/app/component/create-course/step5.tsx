"use client";

import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";

function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
}

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

interface Form {
  label: string;
  type?: string;
  name: string;
  value: string;
  onchange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export default function CourseStep5({ formData, setFormData }: Props) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const form: Form[] = [
    {
      label: "Objective 1",
      type: "text",
      name: "objective_1",
      value: formData.objective_1,
      onchange: handleChange,
    },
    {
      label: "Objective 2",
      type: "text",
      name: "objective_2",
      value: formData.objective_3,
      onchange: handleChange,
    },
    {
      type: "text",
      label: "Objective 3",
      name: "objective_3",
      value: formData.objective_5,
      onchange: handleChange,
    },
    {
      label: "Objective 4",
      type: "text",
      name: "objective_4",
      value: formData.objective_4,
      onchange: handleChange,
    },
    {
      label: "Objective 5",
      type: "text",
      name: "objective_5",
      value: formData.objective_5,
      onchange: handleChange,
    },
  ];
  return (
    <>
      <div>
        <AnimatePresence mode="wait">
          <div key="course_objectives">
            <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
              Course Information
            </h1>
            <div className="my-5 flex flex-col gap-3">
              {form.map((form, i) => (
                <div
                  key={i}
                  className={`border border-[#D2D5DA] flex  flex-col w-full py-[8px] px-[12px] `}
                >
                  <label className="text-textGrey-0 text-[12px]">
                    {form.label}
                  </label>

                  <input
                    type={form.type}
                    name={form.name}
                    value={form.value}
                    onChange={() => handleChange}
                    className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </AnimatePresence>
      </div>
    </>
  );
}
