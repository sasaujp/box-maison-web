import { useEffect, useRef, useState } from "react";

export const useViewBox = () => {
  const screenRef = useRef<HTMLDivElement>(null);

  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [zoom, setZoom] = useState(1);

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
      setZoom(zoom);

      setViewBox({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
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

  return { screenRef, viewBox, viewBoxRef, zoom };
};
