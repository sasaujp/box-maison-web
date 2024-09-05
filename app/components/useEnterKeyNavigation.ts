import { useEffect } from "react";
import { myState } from "@/states/avater";
import { imagesState } from "@/states/meison";

const INTERACTION_DISTANCE = 200; // アバターが画像と相互作用できる距離

export const useEnterKeyNavigation = () => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        const { x, y } = myState.position;
        const nearestImage = imagesState.images.find((image) => {
          const distance = Math.sqrt(
            Math.pow(x - image.cx, 2) + Math.pow(y - image.cy, 2)
          );
          return distance <= INTERACTION_DISTANCE;
        });

        if (nearestImage) {
          window.open(nearestImage.url, "_blank", "noreferrer");
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
};
