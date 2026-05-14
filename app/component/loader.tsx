"use client";
interface Props {
  height: number;
  width: number;
  full_border_color: string;
  small_border_color: string;
  border_width: number;
}
export default function Loader({
  height,
  width,
  full_border_color,
  small_border_color,
  border_width,
}: Props) {
  return (
    <div className="flex w-full justify-center items-center flex-col">
      <div
        className={`animate-spin  rounded-full bg-transparent `}
        style={{
          height: height + "px",
          width: width + "px",
          borderTopColor: full_border_color,
          borderRightColor: small_border_color,
          borderBottomColor: full_border_color,
          borderLeftColor: full_border_color,
          borderWidth: border_width + "px",
        }}
      ></div>
    </div>
  );
}
