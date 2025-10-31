import SubHeader from "./dashboard_subheader";
interface Props {
  removeReview: () => void;
}

interface Quiz {
  question: string;
  quiz_options: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
}
export default function DashboardTutorQuizView({ removeReview }: Props) {
  const quiz: Quiz[] = [
    {
      question:
        "According to the course material, which of these is NOT a key element of a disciple?",
      quiz_options: {
        option1: "Honest communication with God",
        option2: "Regular thanksgiving",
        option3: "Listening to gospel music",
        option4: "Using only formal prayers",
      },
    },
  ];
  return (
    <>
      <div>
        <SubHeader header="Faith In Action" backFunction={removeReview} />
        <div className="dashboard_content_mainbox">
          <div>
            {quiz.map((qz, i) => (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <span className="h-[20px] w-[20px] bg-[#30A46F] text-white flex justify-center items-center rounded-[2px]">
                    {i + 1}
                  </span>
                  <p className="text-textSlightDark-0 font-semibold text-[14px]">
                    {qz.question}
                  </p>
                </div>
                <div className="flex flex-col gap-3 my-4">
                  <label
                    className={`bg-[#F9F9FBB2] py-[6px] px-[12px] text-[14px]`}
                  >
                    {qz.quiz_options.option1}
                  </label>
                  <label
                    className={`bg-[#F9F9FBB2] py-[6px] px-[12px] text-[14px]`}
                  >
                    {qz.quiz_options.option2}
                  </label>
                  <label
                    className={`bg-[#F9F9FBB2] py-[6px] px-[12px] text-[14px]`}
                  >
                    {qz.quiz_options.option3}
                  </label>
                  <label
                    className={`bg-[#F9F9FBB2] py-[6px] px-[12px] text-[14px]`}
                  >
                    {qz.quiz_options.option4}
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button className="form_more bg-white border border-[#D9D9D9] text-primaryColors-0 text-[13px] font-semibold">
            Done
          </button>
          <div className="dashboard_hr mt-3"></div>
        </div>
      </div>
    </>
  );
}
