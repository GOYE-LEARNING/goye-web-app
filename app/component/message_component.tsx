"use client"
interface Props {
  message: string
  status: "good" | "bad"
}
export default function MessageComponent({message} : Props) {
  return <div>{message}</div>;
}
