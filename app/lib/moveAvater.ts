import { RectRoom } from "@/states/meison";
import { AVATAR_SIZE } from "~/components/MyAvaterdRect";

export const isInside = (rect: RectRoom, x: number, y: number) => {
  return x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2;
};

const findRectRoom = (rectRooms: RectRoom[], x: number, y: number) => {
  return rectRooms.find((rectRoom) => {
    if (isInside(rectRoom, x, y)) {
      return rectRoom;
    }
  });
};

const boforeOrAfter = (
  x: number,
  y: number,
  dy: number,
  dx: number,
  rectRooms: RectRoom[]
) => {
  const before = findRectRoom(rectRooms, x, y);
  if (!before) {
    return null;
  }
  const after = findRectRoom(rectRooms, x + dx, y + dy);
  if (!after) {
    return before;
  }

  return after;
};

export const calcNewPosition = (
  position: {
    x: number;
    y: number;
  },
  dx: number,
  dy: number,
  rectRooms: RectRoom[]
): {
  newX: number;
  newY: number;
} => {
  const leftTop = boforeOrAfter(position.x, position.y, dy, dx, rectRooms);
  const rightTop = boforeOrAfter(
    position.x + AVATAR_SIZE,
    position.y,
    dy,
    dx,
    rectRooms
  );
  const leftBottom = boforeOrAfter(
    position.x,
    position.y + AVATAR_SIZE,
    dy,
    dx,
    rectRooms
  );
  const rightBottom = boforeOrAfter(
    position.x + AVATAR_SIZE,
    position.y + AVATAR_SIZE,
    dy,
    dx,
    rectRooms
  );
  if (!leftTop || !rightTop || !leftBottom || !rightBottom) {
    return {
      newX: position.x,
      newY: position.y,
    };
  }
  let newX = position.x + dx;
  newX = Math.max(newX, leftTop.x1, leftBottom.x1);
  newX = Math.min(
    newX,
    rightTop.x2 - AVATAR_SIZE,
    rightBottom.x2 - AVATAR_SIZE
  );

  let newY = position.y + dy;
  newY = Math.max(newY, leftTop.y1, rightTop.y1);
  newY = Math.min(
    newY,
    leftBottom.y2 - AVATAR_SIZE,
    rightBottom.y2 - AVATAR_SIZE
  );
  return {
    newX: newX,
    newY: newY,
  };
};
