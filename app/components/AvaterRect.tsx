import React from "react";
import { useSpring, animated } from "@react-spring/web";

const AVATAR_SIZE = 40;

interface AvatarProps {
  position: { x: number; y: number };
  color?: string;
}

export const AvaterRect: React.FC<AvatarProps> = ({ position, color }) => {
  const animate = useSpring({
    x: position.x,
    y: position.y,
    color: color || "black",
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.rect
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      x={animate.x}
      y={animate.y}
      fill={animate.color}
    />
  );
};
