import React from "react";
import { useSpring, animated } from "@react-spring/web";
import { ReactionBubble } from "./ReactionBubble";

const AVATAR_SIZE = 50;

interface AvatarProps {
  position: { x: number; y: number };
  color?: string;
  reaction: string | null;
}

export const AvaterRect: React.FC<AvatarProps> = ({
  position,
  color,
  reaction,
}) => {
  const animate = useSpring({
    x: position.x,
    y: position.y,
    color: color || "black",
    transform: `translate(${position.x}, ${position.y})`,
    config: { tension: 400, friction: 35 },
  });

  return (
    <>
      <animated.rect
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        x={animate.x}
        y={animate.y}
        fill={animate.color}
      />
      {reaction && (
        <animated.g transform={animate.transform}>
          <ReactionBubble reaction={reaction} />
        </animated.g>
      )}
    </>
  );
};
