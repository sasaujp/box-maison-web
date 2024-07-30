import { cn } from "@/lib/utils";
import { useParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useRoom } from "@/hooks/useRoom";

type Type = {
  roomId: string;
  number: number;
};

async function fetcher<T>(url: string) {
  return fetch(url).then((r) => r.json<T>());
}

export default function Room() {
  const { roomName } = useParams();
  const handle = roomName?.startsWith("@") ? roomName.slice(1) : null;
  const { data } = useSWR<Type>(`/api/rooms/${handle}`, fetcher);
  console.log(data);

  const [position, setPosition] = useState({ x: 50, y: 50 });
  const avatarSize = 40;

  if (!handle) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  useRoom(handle);

  const screenRef = useRef<HTMLDivElement>(null);

  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const viewBoxRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].target) return;

      const rect = entries[0].target.getBoundingClientRect();
      setViewBox({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
      viewBoxRef.current = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
    });
    if (screenRef.current) {
      observer.observe(screenRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 20;
      switch (e.key) {
        case "ArrowUp":
          setPosition((prev) => ({ ...prev, y: Math.max(0, prev.y - speed) }));
          break;
        case "ArrowDown":
          setPosition((prev) => ({
            ...prev,
            y: Math.min(viewBoxRef.current.height - avatarSize, prev.y + speed),
          }));
          break;
        case "ArrowLeft":
          setPosition((prev) => ({ ...prev, x: Math.max(0, prev.x - speed) }));
          break;
        case "ArrowRight":
          setPosition((prev) => ({
            ...prev,
            x: Math.min(viewBoxRef.current.width - avatarSize, prev.x + speed),
          }));
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={cn("h-screen", "w-screen")} ref={screenRef}>
      <svg
        width={viewBox.width}
        height={viewBox.height}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      >
        {/* 部屋の背景 */}
        <rect width="100%" height="100%" fill="#f0f0f0" />

        {/* アバター */}
        <rect
          x={position.x}
          y={position.y}
          width={avatarSize}
          height={avatarSize}
          fill="black"
          className={cn("fill-black")}
        />
      </svg>
    </div>
  );
}
