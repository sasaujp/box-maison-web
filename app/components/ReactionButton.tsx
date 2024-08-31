import React from "react";
import { useSpring, animated } from "@react-spring/web";
import { Button } from "~/components/ui/button";
import { sendReaction } from "@/websocket/command";
import { addReaction } from "@/states/avater";

interface ReactionButtonProps {
  reaction: string;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({ reaction }) => {
  const [{ rotate, scale }, api] = useSpring(() => ({
    rotate: 0,
    scale: 1,
    config: { duration: 80 },
  }));

  const handleClick = () => {
    api.start({
      from: { rotate: 0 },
      to: [
        { rotate: -30, scale: 1.2 },
        { rotate: 30, scale: 1.1 },
        { rotate: -30, scale: 1.15 },
        { rotate: 30, scale: 1.1 },
        { rotate: 0, scale: 1 },
      ],
    });
    sendReaction(reaction);
    addReaction(null, reaction);
  };

  return (
    <animated.div
      style={{
        scale,
        display: "inline-block",
        rotate: rotate.to((r) => `${r}deg`),
      }}
    >
      <Button
        onClick={handleClick}
        variant="outline"
        className="rounded-full w-10 h-10 shadow-2xl text-xl relative"
      >
        {reaction}
      </Button>
    </animated.div>
  );
};
