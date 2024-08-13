import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { myColor, myState } from "@/states/avater";
import { useSnapshot } from "valtio";
import { ReactionBubble } from "./ReactionBubble";
import { isInside, rectRoomsState } from "@/states/meison";

const AVATAR_SIZE = 50;
const SPEED = 900; // pixels per second
const POSITION_UPDATE_THRESHOLD = 0.1;

type Keys = {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
  w: boolean;
  s: boolean;
  a: boolean;
  d: boolean;
};

export const MyAvaterdRect: React.FC = () => {
  const [keys, setKeys] = useState<Keys>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false,
  });

  const my = useSnapshot(myState);
  const lastUpdateTime = useRef(Date.now());
  const animationFrameId = useRef<number | null>(null);
  const { rectRooms } = useSnapshot(rectRoomsState);

  const [animatedPosition, api] = useSpring(() => ({
    x: my.position.x,
    y: my.position.y,
    config: { tension: 400, friction: 35 },
  }));

  const animateTransform = useSpring({
    transform: `translate(${my.position.x}, ${my.position.y})`,
    config: { tension: 400, friction: 35 },
  });

  const { color } = useSpring({
    color: myColor.color,
    config: { tension: 400, friction: 35 },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prevKeys) => ({ ...prevKeys, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prevKeys) => ({ ...prevKeys, [e.key]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;

      let dx = 0;
      let dy = 0;

      if (keys.ArrowUp || keys.w) dy -= 1;
      if (keys.ArrowDown || keys.s) dy += 1;
      if (keys.ArrowLeft || keys.a) dx -= 1;
      if (keys.ArrowRight || keys.d) dx += 1;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        dx /= magnitude;
        dy /= magnitude;
      }

      // Apply speed
      dx *= SPEED * deltaTime;
      dy *= SPEED * deltaTime;

      const rect = rectRooms.find((rectRoom) => {
        if (
          isInside(rectRoom, myState.position.x + 20, myState.position.y + 20)
        ) {
          return rectRoom;
        }
      });
      if (!rect) {
        return;
      }

      const left = myState.position.x + dx;
      const top = myState.position.y + dy;
      const right = left + AVATAR_SIZE;
      const bottom = top + AVATAR_SIZE;

      const isInsideLeftTop = rectRooms.find((rectRoom) => {
        if (isInside(rectRoom, left, top)) {
          return true;
        }
      });
      const isInsideRightTop = rectRooms.find((rectRoom) => {
        if (isInside(rectRoom, right, top)) {
          return true;
        }
      });
      const isInsideLeftBottom = rectRooms.find((rectRoom) => {
        if (isInside(rectRoom, left, bottom)) {
          return true;
        }
      });
      const isInsideRightBottom = rectRooms.find((rectRoom) => {
        if (isInside(rectRoom, right, bottom)) {
          return true;
        }
      });
      let newX = 0;
      let newY = 0;
      if (
        isInsideLeftTop &&
        isInsideRightTop &&
        isInsideLeftBottom &&
        isInsideRightBottom
      ) {
        newX = myState.position.x + dx;
        newY = myState.position.y + dy;
      } else {
        newX = Math.max(
          rect.x1,
          Math.min(rect.x2 - AVATAR_SIZE, myState.position.x + dx)
        );
        newY = Math.max(
          rect.y1,
          Math.min(rect.y2 - AVATAR_SIZE, myState.position.y + dy)
        );
      }

      const changeX = Math.abs(newX - myState.position.x);
      const changeY = Math.abs(newY - myState.position.y);

      if (
        changeX > POSITION_UPDATE_THRESHOLD ||
        changeY > POSITION_UPDATE_THRESHOLD
      ) {
        myState.position.x = newX;
        myState.position.y = newY;
      }
      // return prevPos;
      animationFrameId.current = requestAnimationFrame(updatePosition);
    };

    animationFrameId.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [keys, rectRooms]);

  useEffect(() => {
    api.start({ x: my.position.x, y: my.position.y });
  }, [my, api]);
  return (
    <>
      <animated.rect
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        x={animatedPosition.x}
        y={animatedPosition.y}
        fill={color}
      />
      {my.reaction && (
        <animated.g transform={animateTransform.transform}>
          <ReactionBubble reaction={my.reaction} />
        </animated.g>
      )}
    </>
  );
};
