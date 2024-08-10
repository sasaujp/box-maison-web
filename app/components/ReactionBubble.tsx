import React from "react";
const AVATAR_SIZE = 40;
const BUBBLE_WIDTH = 50;
const BUBBLE_HEIGHT = 50;

export const ReactionBubble: React.FC<{
  reaction: string;
}> = ({ reaction }) => {
  // 吹き出しの形状を定義するSVGパス
  const bubblePath =
    "M10,0 H40 Q50,0 50,10 V30 Q50,40 40,40 H30 L25,50 L20,40 H10 Q0,40 0,30 V10 Q0,0 10,0 Z";

  return (
    <g
      transform={`translate(${
        -BUBBLE_WIDTH / 2 + AVATAR_SIZE / 2
      }, ${-BUBBLE_HEIGHT})`}
    >
      <path d={bubblePath} fill="white" stroke="black" strokeWidth="1" />
      <text
        x="25"
        y="23"
        fontSize="20"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {reaction}
      </text>
    </g>
  );
};
