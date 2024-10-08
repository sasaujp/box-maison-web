import { useEffect, useRef } from "react";
import { svgRectState, zoomState } from "../states/ui";

export const useViewBox = () => {
  const screenRef = useRef<HTMLDivElement>(null);

  const viewBoxRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].target) return;

      const rect = entries[0].target.getBoundingClientRect();
      let zoom = 1.0;
      if (rect.width < 900) {
        zoom = 1.5;
      } else if (rect.width < 1200) {
        zoom = 1.3;
      }
      zoomState.value = zoom;

      svgRectState.x = rect.left;
      svgRectState.y = rect.top;
      svgRectState.width = rect.width;
      svgRectState.height = rect.height;

      viewBoxRef.current = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
    });
    if (screenRef.current) {
      observer.observe(screenRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return { screenRef, viewBoxRef };
};
