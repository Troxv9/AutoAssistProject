
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SpringConfig } from "remotion";
import { COLORS, FONTS } from "../theme";

const CHAR_SPRING: Partial<SpringConfig> = {
  damping: 16,
  mass: 0.7,
  stiffness: 150,
};

export const LetterReveal: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size?: number;
  weight?: number;
  color?: string;
  letterSpacing?: number;
  glow?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  delay = 0,
  stagger = 3,
  size = 120,
  weight = 800,
  color = COLORS.ink,
  letterSpacing = -4,
  glow = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const g = Math.max(0, Math.min(1, glow));
  const textShadow =
    g > 0
      ? `0 0 ${8 * g}px rgba(239,68,68,${0.9 * g}), 0 0 ${34 * g}px rgba(220,38,38,${0.7 * g}), 0 0 ${72 * g}px rgba(220,38,38,${0.45 * g})`
      : "none";

  return (
    <span
      style={{
        display: "inline-flex",
        fontFamily: FONTS.sans,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing,
        lineHeight: 1.02,
        textShadow,
        ...style,
      }}
      aria-label={text}
    >
      {Array.from(text).map((char, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: CHAR_SPRING,
        });
        const y = interpolate(p, [0, 1], [0.55 * size, 0]);
        const blur = interpolate(p, [0, 0.8], [14, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(p, [0, 0.6], [0, 1], {
          extrapolateRight: "clamp",
        });
        const rotate = interpolate(p, [0, 1], [8, 0]);

        return (
          <span
            key={`${char}-${i}`}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              transform: `translateY(${y}px) rotate(${rotate}deg)`,
              filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
              opacity,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </span>
  );
};
