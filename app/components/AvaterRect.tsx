import React, { useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import { ReactionBubble } from "./ReactionBubble";
import { useAvatarAnimation } from "./useAvaterAnimation";
import { BUBBLE_REACTIONS } from "@/states/avater";

const AVATAR_SIZE = 50;

interface AvatarProps {
  position: { x: number; y: number };
  color?: string;
  reaction: { value: string } | null;
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
    config: {
      tension: 100, // やや高めに設定
      friction: 24, // 摩擦を少し増やす
      mass: 2, // 質量を少し増やす
      clamp: true, // オーバーシュートを防ぐ
      velocity: 0, // 初速度をゼロに
    },
  });
  const {
    animationStyle,
    performBounce,
    performRotate,
    performStretch,
    performBow,
    performStumble,
  } = useAvatarAnimation();

  useEffect(() => {
    if (!reaction) return;

    if (reaction.value === "1") {
      performBounce();
    } else if (reaction.value === "2") {
      performStretch();
    } else if (reaction.value === "3") {
      performBow();
    } else if (reaction.value === "4") {
      performRotate();
    } else if (reaction.value === "5") {
      performStumble();
    }
  }, [
    reaction,
    performBounce,
    performRotate,
    performStretch,
    performBow,
    performStumble,
  ]);

  return (
    <animated.g transform={animate.transform}>
      <animated.g
        style={{
          transformOrigin: `${AVATAR_SIZE / 2}px ${AVATAR_SIZE / 2}px`,
          rotate: animationStyle.rotate.to((r) => `${r}deg`),
          scale: animationStyle.scale,
          scaleX: animationStyle.scaleX,
          scaleY: animationStyle.scaleY,
          translateY: animationStyle.translateY,
        }}
      >
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
      </animated.g>
      {reaction && BUBBLE_REACTIONS.includes(reaction.value) && (
        <g>
          <ReactionBubble reaction={reaction.value} />
        </g>
      )}
    </animated.g>
  );
};
