import React, { createContext, SetStateAction, useContext, useState } from "react";


interface QuizState {
  quizContext: string;
  setQuizContext: React.Dispatch<SetStateAction<string>>;
}

const QuizContext = createContext<QuizState | undefined>(undefined);
export default function QuizProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [quizContext, setQuizContext] = useState<string>("");
  return (
    <QuizContext.Provider value={{ quizContext, setQuizContext}}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context == undefined) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
}
