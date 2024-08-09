import { cn } from "@/lib/utils";
import { useParams } from "@remix-run/react";
import { useRoom } from "@/hooks/useRoom";
import { useViewBox } from "@/hooks/useViewBox";
import { MyAvaterdRect } from "@/components/MyAvaterdRect";
import { usersState } from "@/states/avater";
import { useSnapshot } from "valtio";
import { websocketState } from "@/states/websocket";
import { AvaterRect } from "@/components/AvaterRect";

export default function Room() {
  const { roomName } = useParams();
  const handle = roomName?.startsWith("@") ? roomName.slice(1) : null;
  // const { data } = useSWR<Type>(`/api/rooms/${handle}`, fetcher);

  if (!handle) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  websocketState.roomId = handle;

  useRoom();

  const { viewBox, screenRef } = useViewBox();
  const users = useSnapshot(usersState);

  return (
    <div className={cn("h-screen", "w-screen")} ref={screenRef}>
      <svg
        width={viewBox.width}
        height={viewBox.height}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      >
        {/* 部屋の背景 */}
        <rect width="100%" height="100%" className="fill-white" />

        {/* 他のアバター */}
        {users.users.map(({ id, position }) => {
          if (!position) {
            return null;
          }
          return <AvaterRect key={id} position={position} />;
        })}

        {/* 自分のアバター */}
        <MyAvaterdRect width={viewBox.width} height={viewBox.height} />
      </svg>
    </div>
  );
}
