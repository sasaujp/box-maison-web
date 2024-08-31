import { useRef, useCallback } from "react";
import { useSpring } from "@react-spring/web";

const defaultStyle = {
  rotate: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  translateY: 0,
  translateX: 0,
};

export const useAvatarAnimation = () => {
  const animationQueue = useRef<(() => void)[]>([]);

  const [{ rotate, scale, scaleX, scaleY, translateY }, api] = useSpring(
    () => ({
      ...defaultStyle,
      config: { duration: 80 },
    })
  );

  const runNextAnimation = useCallback(() => {
    if (animationQueue.current.length > 0) {
      const nextAnimation = animationQueue.current.shift();
      nextAnimation?.();
    }
  }, []);

  const queueAnimation = useCallback(
    (animation: () => void) => {
      animationQueue.current.push(animation);
      if (animationQueue.current.length === 1) {
        runNextAnimation();
      }
    },
    [runNextAnimation]
  );

  const resetRotation = useCallback(() => {
    api.start({ rotate: 0, immediate: true });
  }, [api]);

  const performRotate = useCallback(() => {
    queueAnimation(() => {
      api.start({
        from: defaultStyle,
        to: [
          { rotate: 90, scale: 1.1 },
          { rotate: 180, scale: 1.2 },
          { rotate: 270, scale: 1.2 },
          { rotate: 360, scale: 1.1 },
          { rotate: 400, scale: 1.0 },
          { rotate: 360, scale: 1.0 },
        ],
        config: { duration: 80, tension: 280, friction: 120 },
        onRest: () => {
          resetRotation();
          runNextAnimation();
        },
      });
    });
  }, [api, queueAnimation, runNextAnimation, resetRotation]);

  const performBounce = useCallback(() => {
    queueAnimation(() => {
      api.start({
        from: defaultStyle,
        to: [
          { rotate: -30, scale: 1.1 },
          { rotate: 30, scale: 1.2 },
          { rotate: -30, scale: 1.2 },
          { rotate: 30, scale: 1.1 },
          { rotate: 0, scale: 1 },
        ],
        config: { duration: 80, tension: 170, friction: 26 },
        onRest: runNextAnimation,
      });
    });
  }, [api, queueAnimation, runNextAnimation]);

  const performStretch = useCallback(
    (duration: number = 1000) => {
      queueAnimation(() => {
        api.start({
          from: defaultStyle,
          to: [
            // 急に背が伸びる
            {
              scaleY: 1.3,
              scaleX: 0.8,
              translateY: -15,
              config: { duration: duration * 0.2 },
            },
            // 少し縮む
            {
              scaleY: 1.2,
              scaleX: 0.85,
              translateY: -10,
              config: { duration: duration * 0.1 },
            },
            // もう一度伸びる
            {
              scaleY: 1.25,
              scaleX: 0.82,
              translateY: -12.5,
              config: { duration: duration * 0.1 },
            },
            // ゆっくり元に戻る
            {
              scaleY: 1,
              scaleX: 1,
              translateY: 0,
              config: { duration: duration * 0.6 },
            },
          ],
          onRest: runNextAnimation,
        });
      });
    },
    [api, queueAnimation, runNextAnimation]
  );

  const performBow = useCallback(
    (duration: number = 1000) => {
      queueAnimation(() => {
        api.start({
          from: defaultStyle,
          to: [
            {
              rotate: -20,
              translateY: 5,
              scale: 0.95,
              config: { duration: duration * 0.3 },
            },
            {
              rotate: -40,
              translateY: 10,
              scale: 0.9,
              config: { duration: duration * 0.2 },
            },
            {
              rotate: -20,
              translateY: 5,
              scale: 0.95,
              config: { duration: duration * 0.2 },
            },
            {
              rotate: 0,
              translateY: 0,
              scale: 1,
              config: { duration: duration * 0.3 },
            },
          ],
          onRest: runNextAnimation,
        });
      });
    },
    [api, queueAnimation, runNextAnimation]
  );

  const performStumble = useCallback(
    (duration: number = 1000) => {
      queueAnimation(() => {
        api.start({
          to: [
            // 急に左上を軸に倒れる
            {
              rotate: 85,
              scaleX: 0.7,
              scaleY: 0.7,
              translateY: 25,
              translateX: -25,
              config: { tension: 400, friction: 15, duration: duration * 0.2 },
            },
            // 少し戻る（反動）
            {
              rotate: 70,
              scaleX: 0.75,
              scaleY: 0.75,
              translateY: 20,
              translateX: -20,
              config: { tension: 300, friction: 10, duration: duration * 0.1 },
            },
            // ゆっくり元に戻る
            {
              rotate: 0,
              scaleX: 1,
              scaleY: 1,
              translateY: 0,
              translateX: 0,
              config: { tension: 200, friction: 20, duration: duration * 0.7 },
            },
          ],
          onRest: runNextAnimation,
        });
      });
    },
    [api, queueAnimation, runNextAnimation]
  );

  return {
    animationStyle: {
      rotate,
      scale,
      scaleX,
      scaleY,
      translateY,
    },
    performStretch,
    performBounce,
    performRotate,
    performBow,
    performStumble,
  };
};
