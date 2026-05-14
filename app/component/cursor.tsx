import { useEffect, useState } from "react";

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className=""
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        borderRadius: "50%",
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: "none",
        zIndex: 9999,
        background: "#ffa500",
        filter: "blur(2px)",
        opacity: 0.8,
        boxShadow:
          "0 0 10px #ffa500, 0 0 25px #ffa500, 0 0 40px rgba(255,165,0,0.6)",
      }}
    />
  );
}
