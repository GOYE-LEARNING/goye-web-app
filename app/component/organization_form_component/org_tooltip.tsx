"use client";
interface Props {
  message: String;
}
export default function OrgTooltip({ message }: Props) {
  return (
    <div className="absolute left-[-20px] top-[2.5rem] z-20 bg-slate-800 rounded py-2 px-3 text-center drop-shadow-2xl ring-1 ring-slate-300/20  w-[150px]">
      <div className="">
        <p>{message}</p>
      </div>
    </div>
  );
}
