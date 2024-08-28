import { proxy } from "valtio";

export type RectRoom = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export const isInside = (rect: RectRoom, x: number, y: number) => {
  return x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2;
};

export const rectRoomsState = proxy({
  rectRooms: [
    // 1つ目の部屋
    {
      x1: 0,
      y1: 0,
      x2: 600,
      y2: 600,
    },
    // 2つ目の部屋
    {
      x1: 800,
      y1: 0,
      x2: 1400,
      y2: 600,
    },
    // 3つ目の部屋
    {
      x1: 0,
      y1: 800,
      x2: 600,
      y2: 1400,
    },
    // 4つ目の部屋
    {
      x1: 800,
      y1: 800,
      x2: 1400,
      y2: 1400,
    },
    {
      x1: 200,
      y1: 600 - 1,
      x2: 400,
      y2: 800 + 1,
    },
    {
      x1: 600 - 1,
      y1: 200,
      x2: 800 + 1,
      y2: 400,
    },
    {
      x1: 1000,
      y1: 600 - 1,
      x2: 1200,
      y2: 800 + 1,
    },
    {
      x1: 600 - 1,
      y1: 1000,
      x2: 800 + 1,
      y2: 1200,
    },
  ] as RectRoom[],
});
