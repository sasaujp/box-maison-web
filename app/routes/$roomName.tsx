import { cn } from "~/lib/utils";
import { useParams } from "@remix-run/react";
import { useViewBox } from "@/hooks/useViewBox";
import { MyAvaterdRect } from "~/components/MyAvaterdRect";
import {
  BUBBLE_REACTIONS,
  myColor,
  myState,
  usersState,
} from "@/states/avater";
import { useSnapshot } from "valtio";
import { disconnect, websocketState } from "@/states/websocket";
import { AvaterRect } from "~/components/AvaterRect";
import Skech from "@uiw/react-color-sketch";
import { colorPicker, svgRectState, viewboxState } from "@/states/ui";
import { useEffect } from "react";
import { rectRoomsState } from "@/states/meison";
import PatternedColorButton from "~/components/PatternedColorButton";
import { ReactionButton } from "~/components/ReactionButton";
import { FloorImages } from "~/components/FloorImages";

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

  const { screenRef } = useViewBox();
  const users = useSnapshot(usersState);
  const { color } = useSnapshot(myColor);
  const { isOpen } = useSnapshot(colorPicker);
  const { rectRooms } = useSnapshot(rectRoomsState);
  const svgRect = useSnapshot(svgRectState);
  const viewbox = useSnapshot(viewboxState).value;

  useEffect(() => {
    const rect = rectRoomsState.rectRooms[0];
    myState.position = {
      x: (rect.x2 - rect.x1) / 2 - 20,
      y: (rect.y2 - rect.y1) / 2 - 20,
    };
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className={cn("h-screen", "w-screen")} ref={screenRef}>
      <svg
        id="room-svg"
        onClick={() => {
          colorPicker.isOpen = false;
        }}
        className="bg-black"
        width={svgRect.width}
        height={svgRect.height}
        viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
      >
        {rectRooms.map(({ x1, y1, x2, y2 }, i) => {
          return (
            <rect
              key={i}
              x={x1}
              y={y1}
              width={x2 - x1}
              height={y2 - y1}
              className="fill-slate-100 stroke-none"
            />
          );
        })}

        <FloorImages viewbox={viewbox} />
        <path
          id="rooms-path"
          d={`
          M -10000 -10000
          H 10000
          V 10000
          H -10000
          Z
          ${rectRooms
            .map(
              ({ x1, y1, x2, y2 }) => `
            M ${x1} ${y1}
            L ${x2} ${y1}
            L ${x2} ${y2}
            L ${x1} ${y2}
            Z
          `
            )
            .join(" ")}
        `}
          fill="black"
          opacity="0.7"
          fillRule="evenodd"
        />
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
        <MyAvaterdRect />
      </svg>
      <div className="absolute bottom-4 right-4 flex flex-row-reverse justify-end items-end gap-2">
        <div className="bg-yellow-50/50 shadow-2xl rounded-2xl p-4 flex flex-col gap-2">
          <PatternedColorButton
            onClick={() => {
              colorPicker.isOpen = !colorPicker.isOpen;
            }}
            className="rounded-full w-10 h-10"
            color={color}
          />
          {BUBBLE_REACTIONS.map((reaction) => {
            return <ReactionButton key={reaction} reaction={reaction} />;
          })}
          <ReactionButton reaction={"1"} />
          <ReactionButton reaction={"2"} />
          <ReactionButton reaction={"3"} />
          <ReactionButton reaction={"4"} />
          <ReactionButton reaction={"5"} />
        </div>

        {/* <div className="absolute bottom-8 right-8 flex flex-col-reverse justify-start items-center">
        <div className="bg-yellow-50/50 w-64 shadow-2xl rounded-2xl p-4 mt-4">
          <div className="flex w-full justify-center">
            <PatternedColorButton
              onClick={() => {
                colorPicker.isOpen = !colorPicker.isOpen;
              }}
              className="rounded-full w-10 h-10"
              color={color}
            />
          </div>
          <div className="flex justify-between mt-4">
            {BUBBLE_REACTIONS.map((reaction) => {
              return <ReactionButton key={reaction} reaction={reaction} />;
            })}
          </div>

          <div className="flex justify-between mt-4">
            <ReactionButton reaction={"1"} />
            <ReactionButton reaction={"2"} />
            <ReactionButton reaction={"3"} />
            <ReactionButton reaction={"4"} />
            <ReactionButton reaction={"5"} />
          </div>
        </div> */}
        {isOpen && (
          <Skech
            disableAlpha={true}
            onChange={(color) => {
              myColor.color = color.hex;
            }}
            className="border-t-0"
          />
        )}
      </div>
    </div>
  );
}
