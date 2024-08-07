import { cn } from "@/lib/utils";
import { useParams } from "@remix-run/react";
import useSWR from "swr";
import { useRoom } from "@/hooks/useRoom";
import { useViewBox } from "@/hooks/useViewBox";
import { MyAvaterdRect } from "@/components/MyAvaterdRect";
import { useAtomValue } from "jotai";
import { activeUsersAtom, avaterPositionsAtom } from "@/atoms/atom";
import { AvaterRect } from "@/components/AvaterRect";

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

  if (!handle) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  useRoom(handle);

  const { viewBox, screenRef } = useViewBox();
  const activeUsers = useAtomValue(activeUsersAtom);
  const avaterPositions = useAtomValue(avaterPositionsAtom);

  console.log("activeUsers", activeUsers);
  console.log("avaterPositions", avaterPositions);

  return (
    <div className={cn("h-screen", "w-screen")} ref={screenRef}>
      <svg
        width={viewBox.width}
        height={viewBox.height}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      >
        {/* 部屋の背景 */}
        <rect width="100%" height="100%" className="fill-white" />

        {/* アバター */}
        <MyAvaterdRect width={viewBox.width} height={viewBox.height} />

        {/* 他のアバター */}
        {activeUsers.map((userId) => {
          const position = avaterPositions[userId];

          if (!position) return null;
          return <AvaterRect key={userId} position={position} />;
        })}
      </svg>
    </div>
  );
}
