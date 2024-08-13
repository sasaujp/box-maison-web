import { rectRoomsState } from "@/states/meison";
import { useMemo } from "react";
import { useSnapshot } from "valtio";

export const useRects = () => {
  const { rectRooms } = useSnapshot(rectRoomsState);

  const houseBox = useMemo(() => {
    const x = Math.min(...rectRooms.map((r) => r.x1));
    const y = Math.min(...rectRooms.map((r) => r.y1));
    const width = Math.max(...rectRooms.map((r) => r.x2));
    const height = Math.max(...rectRooms.map((r) => r.y2));
    return { x, y, width, height };
  }, [rectRooms]);
  return { houseBox };
};
