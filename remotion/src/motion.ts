
import { Easing, interpolate, spring } from "remotion";
import type { SpringConfig } from "remotion";

export const EASE = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  outQuint: Easing.bezier(0.22, 1, 0.36, 1),
  inOutQuint: Easing.bezier(0.83, 0, 0.17, 1),
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

export const ENTER_SPRING: Partial<SpringConfig> = {
  damping: 18,
  mass: 0.8,
  stiffness: 130,
};

export const POP_SPRING: Partial<SpringConfig> = {
  damping: 13,
  mass: 0.6,
  stiffness: 170,
};

export const focusPull = (
  frame: number,
  fps: number,
  delay = 0,
  opts?: {
    distance?: number;
    blur?: number;
    scaleFrom?: number;
    config?: Partial<SpringConfig>;
  }
) => {
  const { distance = 40, blur = 16, scaleFrom = 0.96, config = ENTER_SPRING } =
    opts ?? {};
  const p = spring({ frame: frame - delay, fps, config });
  return {
    progress: p,
    y: interpolate(p, [0, 1], [distance, 0]),
    scale: interpolate(p, [0, 1], [scaleFrom, 1]),
    opacity: interpolate(p, [0, 0.75], [0, 1], { extrapolateRight: "clamp" }),
    blur: interpolate(p, [0, 0.85], [blur, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };
};

export const idleFloat = (frame: number, index = 0, amplitude = 3) => {
  const phase = index * 1.7;
  return {
    y: Math.sin(frame / 46 + phase) * amplitude,
    x: Math.cos(frame / 63 + phase) * amplitude * 0.4,
  };
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const countUp = (
  frame: number,
  target: number,
  start: number,
  end: number,
  easing = EASE.outExpo
) =>
  interpolate(frame, [start, end], [0, target], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const staggerItem = (
  frame: number,
  fps: number,
  index: number,
  opts?: {
    delay?: number;
    stagger?: number;
    distance?: number;
    blur?: number;
    config?: Partial<SpringConfig>;
  }
) => {
  const {
    delay = 0,
    stagger = 6,
    distance = 24,
    blur = 10,
    config = ENTER_SPRING,
  } = opts ?? {};
  const p = spring({ frame: frame - delay - index * stagger, fps, config });
  return {
    progress: p,
    y: interpolate(p, [0, 1], [distance, 0]),
    x: 0,
    opacity: interpolate(p, [0, 0.7], [0, 1], { extrapolateRight: "clamp" }),
    blur: interpolate(p, [0, 0.85], [blur, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };
};

export const blurCss = (b: number) => (b > 0.15 ? `blur(${b}px)` : undefined);
