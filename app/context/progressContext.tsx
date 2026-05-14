import React, { createContext, useContext, useState, ReactNode } from "react";

interface ProgressContextType {
  progressId: string;
  setProgressId: React.Dispatch<React.SetStateAction<string>>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
  children: ReactNode;
}

export default function ProgressProvider({ children }: ProgressProviderProps) {
  const [progressId, setProgressId] = useState<string>("");

  return (
    <ProgressContext.Provider value={{ progressId, setProgressId }}>
      {children}
    </ProgressContext.Provider>
  );
}

// Custom hook with error handling
export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  
  return context;
};