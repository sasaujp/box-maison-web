import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { myState } from "@/states/avater";
import { websocketState } from "@/states/websocket";

import { throttledSendPosition } from "@/websocket/command";
import { useSnapshot } from "valtio";

const AVATAR_SIZE = 40;
const SPEED = 900; // pixels per second
const POSITION_UPDATE_THRESHOLD = 0.1;

interface SmoothAvatarProps {
  width: number;
  height: number;
}

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

export const MyAvaterdRect: React.FC<SmoothAvatarProps> = ({
  width,
  height,
}) => {
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
  const { isConnected, socketRef } = useSnapshot(websocketState);
  const lastUpdateTime = useRef(Date.now());
  const animationFrameId = useRef<number | null>(null);

  const [animatedPosition, api] = useSpring(() => ({
    x: my.position.x,
    y: my.position.y,
    config: { tension: 170, friction: 26 },
  }));

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

      const newX = Math.max(
        0,
        Math.min(width - AVATAR_SIZE, myState.position.x + dx)
      );
      const newY = Math.max(
        0,
        Math.min(height - AVATAR_SIZE, myState.position.y + dy)
      );

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
  }, [keys, width, height]);

  useEffect(() => {
    api.start({ x: my.position.x, y: my.position.y });
  }, [my, api]);

  useEffect(() => {
    if (isConnected && socketRef.socket) {
      throttledSendPosition(socketRef.socket, my.position);
    }
  }, [socketRef, isConnected, my]);

  return (
    <animated.rect
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      x={animatedPosition.x}
      y={animatedPosition.y}
      fill="red"
    />
  );
};
