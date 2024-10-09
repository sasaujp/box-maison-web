import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { BUBBLE_REACTIONS, myColor, myState } from "@/states/avater";

import { useSnapshot } from "valtio";
import { ReactionBubble } from "./ReactionBubble";
import { imagesState, rectRoomsState } from "@/states/meison";
import { calcNewPosition } from "~/lib/moveAvater";
import { useAvatarAnimation } from "./useAvaterAnimation";
import { svgRectState, viewboxState } from "@/states/ui";

export const AVATAR_SIZE = 50;
const SPEED = 600; // pixels per second
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
  clientX: number | null;
  clientY: number | null;
};

const clientToSvgCoords = (clientX: number, clientY: number) => {
  const viewbox = viewboxState.value;
  return {
    x:
      viewbox.x +
      (clientX - svgRectState.x) * (viewbox.width / svgRectState.width),
    y:
      viewbox.y +
      (clientY - svgRectState.y) * (viewbox.height / svgRectState.height),
  };
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
    clientX: null,
    clientY: null,
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

  const [touchStartMyAvater, setTouchStartMyAvater] = useState(false);

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

    const roomSvg = document.getElementById(
      "room-svg"
    )! as unknown as SVGSVGElement;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("#my-avater") && my.isAvatarOverLink) {
        return;
      }

      roomSvg.setPointerCapture(e.pointerId);

      setKeys((prevKeys) => ({
        ...prevKeys,
        clientX: e.clientX,
        clientY: e.clientY,
      }));
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!roomSvg.hasPointerCapture(e.pointerId)) {
        return;
      }
      setKeys((prevKeys) => ({
        ...prevKeys,
        clientX: e.clientX,
        clientY: e.clientY,
      }));
    };

    const handlePointerUp = (e: PointerEvent) => {
      roomSvg.releasePointerCapture(e.pointerId);
      setKeys((prevKeys) => ({ ...prevKeys, clientX: null, clientY: null }));
    };
    roomSvg.addEventListener("touchstart", (e) => {
      e.preventDefault();
    });
    roomSvg.addEventListener("touchend", (e) => {
      e.preventDefault();
    });

    roomSvg.addEventListener("pointerdown", handlePointerDown);
    roomSvg.addEventListener("pointermove", handlePointerMove);
    roomSvg.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      roomSvg.removeEventListener("pointerdown", handlePointerDown);
      roomSvg.removeEventListener("pointermove", handlePointerDown);
      roomSvg.removeEventListener("pointerup", handlePointerUp);
    };
  }, [my.isAvatarOverLink]);

  useEffect(() => {
    const updatePosition = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;

      let dx = 0;
      let dy = 0;
      const { clientX, clientY } = keys;

      if (clientX === null || clientY === null) {
        if (keys.ArrowUp || keys.w) dy -= 1;
        if (keys.ArrowDown || keys.s) dy += 1;
        if (keys.ArrowLeft || keys.a) dx -= 1;
        if (keys.ArrowRight || keys.d) dx += 1;

        if (dx === 0 && dy === 0) {
          animationFrameId.current = requestAnimationFrame(updatePosition);
          return;
        }

        const magnitude = Math.sqrt(dx * dx + dy * dy);
        dx /= magnitude;
        dy /= magnitude;
        // Apply speed
        dx *= SPEED * deltaTime;
        dy *= SPEED * deltaTime;
      } else {
        const { x, y } = clientToSvgCoords(clientX, clientY);

        const distance = Math.sqrt(
          Math.pow(x - (my.position.x + AVATAR_SIZE / 2), 2) +
            Math.pow(y - (my.position.y + AVATAR_SIZE / 2), 2)
        );
        if (distance < 1) {
          animationFrameId.current = requestAnimationFrame(updatePosition);
          return;
        }

        dx = x - (my.position.x + AVATAR_SIZE / 2);
        dy = y - (my.position.y + AVATAR_SIZE / 2);
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        dx /= magnitude;
        dy /= magnitude;

        // マウスだとなんかはやいので、0.8倍にしておく
        const moveDistance = Math.min(distance, SPEED * deltaTime);
        if (distance < moveDistance) {
          animationFrameId.current = requestAnimationFrame(updatePosition);
          return;
        }
        // 速度を適用
        dx *= moveDistance;
        dy *= moveDistance;
      }

      if (dx === 0 && dy === 0) {
        animationFrameId.current = requestAnimationFrame(updatePosition);
        return;
      }

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

  const linkAnimation = useSpring({
    opacity: my.isAvatarOverLink ? 1 : 0,
    config: { duration: 250 },
  });

  const onClickLink = useCallback(() => {
    const x = my.position.x + AVATAR_SIZE / 2;
    const y = my.position.y + AVATAR_SIZE / 2;
    const nearestImage = imagesState.images.find((image) => {
      const distance = Math.sqrt(
        Math.pow(x - image.cx, 2) + Math.pow(y - image.cy, 2)
      );
      return distance <= 100;
    });

    if (nearestImage) {
      window.open(nearestImage.url, "_blank", "noreferrer");
    }
  }, [my.position.x, my.position.y]);

  return (
    <animated.g
      id="my-avater"
      transform={animateTransform.transform}
      onTouchStart={(e) => {
        setTouchStartMyAvater(true);
        e.preventDefault();
      }}
      onTouchEnd={(e) => {
        if (touchStartMyAvater && my.isAvatarOverLink) {
          onClickLink();
        }
        setTouchStartMyAvater(false);
        e.preventDefault();
      }}
    >
      <animated.g
        style={{
          transformOrigin: `${AVATAR_SIZE / 2}px ${AVATAR_SIZE / 2}px`,
          rotate: animationStyle.rotate.to((r) => `${r}deg`),
          scale: animationStyle.scale,
          scaleX: animationStyle.scaleX,
          scaleY: animationStyle.scaleY,
          cursor: my.isAvatarOverLink ? "pointer" : undefined,
          translateY: animationStyle.translateY,
        }}
        onClick={my.isAvatarOverLink ? onClickLink : undefined}
      >
        <animated.rect
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          x={0}
          y={0}
          opacity={my.isAvatarOverLink ? 0.8 : undefined}
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
        <animated.rect
          x="0"
          y="0"
          width="50"
          height="50"
          fill="none"
          stroke="#0000EE"
          rx="10"
          ry="10"
          opacity={linkAnimation.opacity}
        >
          <animate
            attributeName="stroke-width"
            values="2;5;2"
            dur="1s"
            repeatCount="indefinite"
          />
        </animated.rect>
      </animated.g>

      {my.reaction && BUBBLE_REACTIONS.includes(my.reaction.value) && (
        <g>
          <ReactionBubble reaction={my.reaction.value} />
        </g>
      )}
    </animated.g>
  );
};
