import React from "react";
import { Button, ButtonProps } from "~/components/ui/button";

interface PatternedColorButtonProps
  extends Omit<ButtonProps, "className" | "style"> {
  color: string;
  className?: string;
  patternOpacity?: number;
}

const PatternedColorButton: React.FC<PatternedColorButtonProps> = ({
  color,
  className = "",
  patternOpacity = 0.2,
  ...props
}) => {
  return (
    <Button
      className={`relative overflow-hidden rounded-full w-10 h-10 ${className}`}
      style={{ backgroundColor: color }}
      {...props}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
      >
        <defs>
          <pattern
            id={`diagonalHatch-${color.replace("#", "")}`}
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
          >
            <path
              d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4"
              stroke="white"
              strokeWidth="2"
              opacity={patternOpacity}
            />
          </pattern>
        </defs>
        <rect
          width="40"
          height="40"
          fill={`url(#diagonalHatch-${color.replace("#", "")})`}
          rx="10"
          ry="10"
        />
      </svg>
    </Button>
  );
};

export default PatternedColorButton;
