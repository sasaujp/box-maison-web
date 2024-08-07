import React, { useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

const AVATAR_SIZE = 40;

interface AvatarProps {
  position: { x: number; y: number };
}

export const AvaterRect: React.FC<AvatarProps> = ({ position }) => {
  const [animatedPosition, api] = useSpring(() => ({
    x: position.x,
    y: position.y,
    config: { tension: 170, friction: 26 },
  }));

  useEffect(() => {
    api.start({ x: position.x, y: position.y });
  }, [position, api]);

  return (
    <animated.rect
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      x={animatedPosition.x}
      y={animatedPosition.y}
      fill="blue"
    />
  );
};
