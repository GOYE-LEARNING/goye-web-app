"use client";
import { FaArrowRight, FaCheck } from "react-icons/fa";

export default function Step2({ formData, setFormData }: any) {
  const selected = formData.role;

  const formComponent = [
    { label: "Student", label_p: "I want to learn and track my journey", value: "student" },
    { label: "Instructor", label_p: "I want to teach and guide others", value: "instructor" },
  ];

  const handleSelect = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  return (
    <div>
      <h1 className="form_h1">What's your role?</h1>
      <p className="form-p my-5">Your role helps us to personalize your GOYE journey.</p>

      <form className="flex gap-5 my-5 flex-col">
        {formComponent.map((form, i) => {
          const isActive = selected === form.value;
          return (
            <label
              key={i}
              htmlFor={form.value}
              onClick={() => handleSelect(form.value)}
              className={`w-full border p-3 flex justify-between items-center cursor-pointer transition-all duration-200 ${
                isActive ? "border-primaryColors-0 bg-primaryColors-0/5" : ""
              }`}
            >
              <input id={form.value} type="radio" name="role" checked={isActive} value={form.value} onChange={() => handleSelect(form.value)} className="hidden" />
              <div>
                <h1 className={`font-semibold ${isActive ? "text-primaryColors-0" : ""}`}>{form.label}</h1>
                <p className="form-p">{form.label_p}</p>
              </div>
              <div>
                <span className="text-primaryColors-0">{isActive ? <FaCheck size={12} /> : <FaArrowRight size={12} />}</span>
              </div>
            </label>
          );
        })}
      </form>
    </div>
  );
}
