import { proxy } from "valtio";

type RectRoom = {
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
    {
      x1: 0,
      y1: 0,
      x2: 1200,
      y2: 1000,
    },
    {
      x1: 300,
      y1: 1000,
      x2: 500,
      y2: 1250,
    },
    {
      x1: 0,
      y1: 1250,
      x2: 800,
      y2: 1650,
    },
    {
      x1: 1200,
      y1: 400,
      x2: 1400,
      y2: 600,
    },
    {
      x1: 1400,
      y1: 200,
      x2: 2800,
      y2: 900,
    },
  ] as RectRoom[],
});
