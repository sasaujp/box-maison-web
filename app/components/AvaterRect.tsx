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
      <animated.g transform={animate.transform}>
        <animated.rect
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          x={0}
          y={0}
          fill={color}
          rx="10"
          ry="10"
        />
        <animated.rect
          x={2.5}
          y={2.5}
          width={AVATAR_SIZE - 5}
          height={AVATAR_SIZE - 5}
          fill="white"
          opacity="0.1"
          rx="10"
          ry="10"
        />
        <pattern
          id="diagonalHatch"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
        >
          <path
            d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4"
            stroke="white"
            strokeWidth="2"
            opacity="0.2"
          />
        </pattern>
        <rect
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          fill="url(#diagonalHatch)"
          rx="10"
          ry="10"
        />
        <circle cx={37.5} cy={12.5} r="7.5" fill="white" opacity="0.2" />
        {reaction && (
          <g>
            <ReactionBubble reaction={reaction} />
          </g>
        )}
      </animated.g>
    </>
  );
};
