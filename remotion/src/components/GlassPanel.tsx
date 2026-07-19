import React from "react";
import { GLASS, COLORS } from "../theme";

export const GlassPanel: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  accent?: boolean;
  radius?: number;
}> = ({ style, children, accent = false, radius = 20 }) => {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: radius,
        background: GLASS.background,
        border: accent
          ? `1px solid ${COLORS.accentBright}`
          : GLASS.border,
        backdropFilter: GLASS.backdropFilter,
        WebkitBackdropFilter: GLASS.WebkitBackdropFilter,
        boxShadow: accent
          ? `${GLASS.boxShadow}, 0 0 40px -6px rgba(239,68,68,0.55)`
          : GLASS.boxShadow,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
