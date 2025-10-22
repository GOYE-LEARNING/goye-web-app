"use client";

interface Props {
  value: string;
  onChange: () => void;
  countries: object;
}
export default function DropDowns({ value: onChange, countries }: Props) {
  return (
    <>
      <div className="w-full absolute left-0 h-[230px] overflow-x-hidden scrollbar drop-shadow-md bg-white z-10 rounded-sm">
        {countries as any}
      </div>
    </>
  );
}
