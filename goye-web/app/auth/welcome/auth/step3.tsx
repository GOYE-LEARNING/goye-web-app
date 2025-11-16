"use client";
import { FaArrowRight, FaCheck } from "react-icons/fa";

export default function Step3({ formData, setFormData }: any) {
  const selected = formData.level;

  const formComponent = [
    { label: "Beginner", label_p: "I want to start fresh with the basics", value: "beginner" },
    { label: "Intermediate", label_p: "I want to deepen my understanding", value: "intermediate" },
  ];

  const handleSelect = (value: string) => {
    setFormData({ ...formData, level: value });
  };

  return (
    <div>
      <h1 className="form_h1">Your experience level?</h1>
      <p className="form-p my-5">Helps us tailor your content perfectly.</p>

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
              <input id={form.value} type="radio" name="level" checked={isActive} value={form.value} onChange={() => handleSelect(form.value)} className="hidden" />
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
