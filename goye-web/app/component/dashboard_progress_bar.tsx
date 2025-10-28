"use client";
interface Props {
  width: number;
  backgroundColor: string
}
export default function DashboardProgressBar({ width, backgroundColor }: Props) {
  return (
    <>
      <div className=" relative h-[8px] bg-boldShadyColor-0 w-full">
        <div
          className={`h-[8px]`}
          style={{ width: `${width}%`, backgroundColor: `${backgroundColor}` }}
        ></div>
      </div>
    </>
  );
}
