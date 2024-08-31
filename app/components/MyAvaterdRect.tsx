import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { BUBBLE_REACTIONS, myColor, myState } from "@/states/avater";
import { useSnapshot } from "valtio";
import { ReactionBubble } from "./ReactionBubble";
import { rectRoomsState } from "@/states/meison";
import { calcNewPosition } from "~/lib/moveAvater";
import { useAvatarAnimation } from "./useAvaterAnimation";

export const AVATAR_SIZE = 50;
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
  const {
    animationStyle,
    performBounce,
    performRotate,
    performStretch,
    performBow,
    performStumble,
  } = useAvatarAnimation();

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

      if (dx === 0 && dy === 0) {
        animationFrameId.current = requestAnimationFrame(updatePosition);
        return;
      }

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        dx /= magnitude;
        dy /= magnitude;
      }

      // Apply speed
      dx *= SPEED * deltaTime;
      dy *= SPEED * deltaTime;

      const { newX, newY } = calcNewPosition(
        my.position,
        dx,
        dy,
        rectRoomsState.rectRooms
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
  }, [keys, my.position, rectRooms]);

  useEffect(() => {
    if (!my.reaction) return;

    if (my.reaction.value === "1") {
      performBounce();
    } else if (my.reaction.value === "2") {
      performStretch();
    } else if (my.reaction.value === "3") {
      performBow();
    } else if (my.reaction.value === "4") {
      performRotate();
    } else if (my.reaction.value === "5") {
      performStumble();
    }
  }, [
    my.reaction,
    performBounce,
    performRotate,
    performStretch,
    performBow,
    performStumble,
  ]);

  return (
    <animated.g transform={animateTransform.transform}>
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

      {my.reaction && BUBBLE_REACTIONS.includes(my.reaction.value) && (
        <g>
          <ReactionBubble reaction={my.reaction.value} />
        </g>
      )}
    </animated.g>
  );
};
