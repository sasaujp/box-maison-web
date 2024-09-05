import { proxy, subscribe } from "valtio";
import { myState } from "./avater";

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
      y1: 600,
      x2: 400,
      y2: 800,
    },
    {
      x1: 600,
      y1: 200,
      x2: 800,
      y2: 400,
    },
    {
      x1: 1000,
      y1: 600,
      x2: 1200,
      y2: 800,
    },
    {
      x1: 600,
      y1: 1000,
      x2: 800,
      y2: 1200,
    },
  ] as RectRoom[],
});

export type ImageStateType = {
  src: string;
  url: string;
  cx: number;
  cy: number;
};

export const imagesState = proxy({
  images: [
    {
      src: "google.png",
      url: "https://www.google.com",
      cx: 300,
      cy: 300,
    },
    {
      src: "amongus.png",
      url: "https://www.innersloth.com/gameAmongUs.php",
      cx: 1100,
      cy: 1100,
    },
    {
      src: "yahoo.png",
      url: "https://www.yahoo.co.jp",
      cx: 1000,
      cy: 300,
    },
  ] as ImageStateType[],
});

if (typeof window !== "undefined") {
  subscribe(myState, () => {
    const { x, y } = myState.position;

    imagesState.images.sort((a, b) => {
      const d1 = Math.sqrt(Math.pow(x - a.cx, 2) + Math.pow(y - a.cy, 2));
      const d2 = Math.sqrt(Math.pow(x - b.cx, 2) + Math.pow(y - b.cy, 2));
      return d2 - d1;
    });
  });
}
