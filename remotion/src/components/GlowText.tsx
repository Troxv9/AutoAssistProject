import React from "react";
import { COLORS, FONTS } from "../theme";

export const GlowText: React.FC<{
  children: React.ReactNode;
  glow?: number;
  size?: number;
  weight?: number;
  color?: string;
  letterSpacing?: number;
  mono?: boolean;
  style?: React.CSSProperties;
}> = ({
  children,
  glow = 0,
  size = 96,
  weight = 800,
  color = COLORS.ink,
  letterSpacing = -2,
  mono = false,
  style,
}) => {
  const g = Math.max(0, Math.min(1, glow));
  const textShadow =
    g > 0
      ? `0 0 ${8 * g}px rgba(239,68,68,${0.9 * g}), 0 0 ${34 * g}px rgba(220,38,38,${0.7 * g}), 0 0 ${72 * g}px rgba(220,38,38,${0.45 * g})`
      : "none";

  return (
    <span
      style={{
        fontFamily: mono ? FONTS.mono : FONTS.sans,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing,
        lineHeight: 1.02,
        textShadow,
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
};
