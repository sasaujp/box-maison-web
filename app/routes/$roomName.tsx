import { cn } from "~/lib/utils";
import { useParams } from "@remix-run/react";
import { useViewBox } from "@/hooks/useViewBox";
import { MyAvaterdRect } from "~/components/MyAvaterdRect";
import { addReaction, myColor, usersState } from "@/states/avater";
import { useSnapshot } from "valtio";
import { disconnect, websocketState } from "@/states/websocket";
import { AvaterRect } from "~/components/AvaterRect";
import { Button } from "~/components/ui/button";
import Skech from "@uiw/react-color-sketch";
import { colorPicker } from "@/states/ui";
import { sendReaction } from "@/websocket/command";
import { useEffect } from "react";

const REACTIONS = ["👍", "👋", "😊", "🎉", "❤️"];

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

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const { viewBox, screenRef } = useViewBox();
  const users = useSnapshot(usersState);
  const { color } = useSnapshot(myColor);
  const { isOpen } = useSnapshot(colorPicker);

  return (
    <div className={cn("h-screen", "w-screen")} ref={screenRef}>
      <svg
        onClick={() => {
          colorPicker.isOpen = false;
        }}
        width={viewBox.width}
        height={viewBox.height}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      >
        {/* 部屋の背景 */}
        <rect width="100%" height="100%" className="fill-slate-100" />

        {/* 他のアバター */}
        {users.users.map(({ id, position, color, reaction }) => {
          if (!position) {
            return null;
          }
          return (
            <AvaterRect
              key={id}
              position={position}
              color={color}
              reaction={reaction}
            />
          );
        })}

        {/* 自分のアバター */}
        <MyAvaterdRect width={viewBox.width} height={viewBox.height} />
      </svg>
      <div className="absolute bottom-8 right-8 flex flex-col-reverse justify-start items-center">
        <div className="bg-yellow-50/50 w-64 shadow-2xl rounded-2xl p-4">
          <div className="flex w-full justify-center">
            <Button
              onClick={() => {
                colorPicker.isOpen = !colorPicker.isOpen;
              }}
              className="rounded-full w-10 h-10"
              style={{
                backgroundColor: color,
              }}
            />
          </div>
          <div className="flex justify-between mt-4">
            {REACTIONS.map((reaction) => {
              return (
                <Button
                  key={reaction}
                  onClick={() => {
                    sendReaction(reaction);
                    addReaction(null, reaction);
                  }}
                  variant="outline"
                  className="rounded-full w-10 h-10 shadow-2xl"
                >
                  {reaction}
                </Button>
              );
            })}
          </div>
        </div>
        {isOpen && (
          <Skech
            disableAlpha={true}
            onChange={(color) => {
              myColor.color = color.hex;
            }}
            className="border-t-0 mb-4"
          />
        )}
      </div>
    </div>
  );
}
