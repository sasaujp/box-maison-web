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
import { colorPicker } from "@/states/ui";
import { useEffect } from "react";
import { useRects } from "@/hooks/useRects";
import { rectRoomsState } from "@/states/meison";
import PatternedColorButton from "~/components/PatternedColorButton";
import { ReactionButton } from "~/components/ReactionButton";

function easeOutCirc(x: number): number {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
}

const calcSmoothBounce = (
  pos: number,
  viewSize: number,
  roomStart: number,
  roomSize: number,
  easeFunc: (x: number) => number
) => {
  // 端から画面サイズの半分の位置で調整を開始
  const edgeThreshold = Math.min(viewSize * 0.7, (roomSize - roomStart) * 0.5);
  let bounce = 0;
  if (pos < roomStart + edgeThreshold) {
    const factor = (roomStart + edgeThreshold - pos) * 0.5;
    bounce = factor;
    bounce = easeFunc(factor / (edgeThreshold / 2)) * factor;
  } else if (pos > roomStart + roomSize - edgeThreshold) {
    const factor = -(pos - (roomStart + roomSize - edgeThreshold)) * 0.5;
    bounce = easeFunc(-factor / (edgeThreshold / 2)) * factor;
  }

  return bounce;
};

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

  const { viewBox, screenRef, zoom } = useViewBox();
  const users = useSnapshot(usersState);
  const { color } = useSnapshot(myColor);
  const { isOpen } = useSnapshot(colorPicker);
  const { position } = useSnapshot(myState);
  const { houseBox } = useRects();
  const { rectRooms } = useSnapshot(rectRoomsState);

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

  const bounceX = calcSmoothBounce(
    position.x,
    viewBox.width,
    houseBox.x,
    houseBox.width,
    easeOutCirc
  );
  const bounceY = calcSmoothBounce(
    position.y,
    viewBox.height,
    houseBox.y,
    houseBox.height,
    easeOutCirc
  );
  return (
    <div className={cn("h-screen", "w-screen")} ref={screenRef}>
      <svg
        onClick={() => {
          colorPicker.isOpen = false;
        }}
        className="bg-black"
        width={viewBox.width}
        height={viewBox.height}
        viewBox={`${viewBox.x + position.x - viewBox.width / 2 + bounceX} ${
          viewBox.y + position.y - viewBox.height / 2 + bounceY
        } ${viewBox.width * zoom} ${viewBox.height * zoom}`}
      >
        {/* 部屋の枠 */}
        {rectRooms.map(({ x1, y1, x2, y2 }, i) => {
          return (
            <rect
              key={i}
              x={x1}
              y={y1}
              width={x2 - x1}
              height={y2 - y1}
              className="fill-slate-100"
            />
          );
        })}

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
      <div className="absolute bottom-8 right-8 flex flex-col-reverse justify-start items-center">
        <div className="bg-yellow-50/50 w-64 shadow-2xl rounded-2xl p-4">
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
