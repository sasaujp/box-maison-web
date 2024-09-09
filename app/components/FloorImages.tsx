import React, { useState, useEffect, useRef } from "react";
import { animated, useSpring } from "@react-spring/web";
import { myState } from "@/states/avater";
import { useSnapshot } from "valtio";
import { imagesState } from "@/states/meison";
import { useEnterKeyNavigation } from "./useEnterKeyNavigation";

const MAX_WIDTH = 900;
const MAX_HEIGHT = 700;
const MIN_SIZE = 50;
export const INTERACTION_DISTANCE = 400;

const FloorImage: React.FC<
  { cx: number; cy: number; src: string } & {
    viewbox: { x: number; y: number; width: number; height: number };
  }
> = ({ src, cx, cy }) => {
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const imgRef = useRef<SVGImageElement>(null);
  const { position: avatarPosition } = useSnapshot(myState);

  const distance = Math.sqrt(
    Math.pow(avatarPosition.x - cx, 2) + Math.pow(avatarPosition.y - cy, 2)
  );

  const { width, height } = useSpring({
    width: Math.max(
      MIN_SIZE,
      Math.min(
        MAX_WIDTH,
        MAX_WIDTH - (distance / INTERACTION_DISTANCE) * (MAX_WIDTH - MIN_SIZE)
      )
    ),
    height: Math.max(
      MIN_SIZE,
      Math.min(
        MAX_HEIGHT,
        MAX_HEIGHT - (distance / INTERACTION_DISTANCE) * (MAX_HEIGHT - MIN_SIZE)
      )
    ),
    config: { tension: 300, friction: 40 },
  });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
    };
    img.src = src;
  }, [src]);

  const maskId = `mask-${cx}-${cy}`;
  return (
    <>
      <defs>
        <mask id={maskId}>
          <animated.rect
            x={width.to((s) => cx - s / 2)}
            y={height.to((s) => cy - s / 2)}
            width={width}
            height={height}
            fill="white"
            rx="20"
            ry="20"
          />
          {/* <use href="#rooms-path" /> */}
        </mask>
      </defs>
      <image
        ref={imgRef}
        href={src}
        x={cx - dimensions.width / 2}
        y={cy - dimensions.height / 2 + dimensions.height / 5}
        width={dimensions.width}
        height={dimensions.height}
        mask={`url(#${maskId})`}
      />
    </>
  );
};

export const FloorImages: React.FC<{
  viewbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}> = ({ viewbox }) => {
  useEnterKeyNavigation();
  return (
    <>
      {imagesState.images.map(({ src, cx, cy }) => {
        return (
          <FloorImage key={src} cx={cx} cy={cy} src={src} viewbox={viewbox} />
        );
      })}
    </>
  );
};
