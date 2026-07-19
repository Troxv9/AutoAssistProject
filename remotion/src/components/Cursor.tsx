
import React from "react";
import { interpolate } from "remotion";
import { EASE } from "../motion";

export const CURSOR_SIZE = 44;

export const Cursor: React.FC<{
  x: number;
  y: number;
  click?: number;
  opacity?: number;
}> = ({ x, y, click = 0, opacity = 1 }) => {
  const press = interpolate(click, [0, 0.5, 1], [1, 0.86, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringScale = interpolate(click, [0, 1], [0.2, 2.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outExpo,
  });
  const ringOpacity = interpolate(click, [0, 0.15, 1], [0, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -30,
          top: -30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "3px solid rgba(220,38,38,0.9)",
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />

      
      <svg
        width={CURSOR_SIZE}
        height={CURSOR_SIZE}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `scale(${press})`,
          transformOrigin: "4px 3px",
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
        }}
      >
        <path
          d="M4 2.5 L4 19 L8.6 14.8 L11.4 21.2 L14 20 L11.2 13.7 L17.4 13.5 Z"
          fill="#0A0A0A"
          stroke="#FFFFFF"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
