"use client";

import StudentTutors from "./student_tutors";

interface Props {
  openPrivateMessage: (userId: string, userName: string) => void;
    closePrivateMessages: () => void;

}

export default function PrivateChat({ openPrivateMessage, closePrivateMessages }: Props) {
  return (
    <div className="w-full h-full">
      <div className="lg:bg-shadyColor-0/50 lg:border lg:border-boldShadyColor-0/80  backdrop-blur-md border border-white/10 w-full max-w-full min-w-0 lg:rounded-[20px] lg:py-5 lg:px-6 overflow-y-auto scrollbar2 shadow-sm bg-transparent" style={{ height: "100%" }}>
        <StudentTutors openPrivateMessages={openPrivateMessage} closePrivateMessageContainer={closePrivateMessages}/>
      </div>
    </div>
  );
}