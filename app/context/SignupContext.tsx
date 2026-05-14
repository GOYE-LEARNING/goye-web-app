"use client";
import { createContext, useContext, useState } from "react";

interface SignupData {
  firstname: string;
  lastname: string;
  email: string;
  country?: string;
  city?: string;
  phone?: string;
  role?: string;
  level?: string;
  password?: string;
}

const SignupContext = createContext<any>(null);

export const SignupProvider = ({ children }: { children: React.ReactNode }) => {
  const [formData, setFormData] = useState<SignupData>({
    firstname: "",
    lastname: "",
    email: "",
  });

  return (
    <SignupContext.Provider value={{ formData, setFormData }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => useContext(SignupContext);
