
import React from "react";
import { interpolate } from "remotion";
import { SURFACE, FONTS, COLORS } from "../theme";
import { SparkleIcon } from "./Icons";

export const UserBubble: React.FC<{
  text: string;
  time: string;
  progress?: number;
}> = ({ text, time, progress = 1 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div
        style={{
          maxWidth: 560,
          padding: "22px 30px",
          borderRadius: 26,
          borderBottomRightRadius: 8,
          background: `linear-gradient(160deg, ${COLORS.accentBright}, ${COLORS.accent})`,
          color: "#fff",
          fontFamily: FONTS.sans,
          fontSize: 34,
          fontWeight: 600,
          lineHeight: 1.32,
          boxShadow: "0 18px 40px -18px rgba(220,38,38,0.55)",
        }}
      >
        {text}
      </div>
      <Avatar kind="user" />
    </div>
    <div
      style={{
        marginRight: 66,
        fontFamily: FONTS.mono,
        fontSize: 18,
        color: SURFACE.inkFaint,
        opacity: interpolate(progress, [0.6, 1], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {time}
    </div>
  </div>
);

export const AssistantRow: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <Avatar kind="ai" />
    {children}
  </div>
);


const DOT_PERIOD = 75;
export const TypingDots: React.FC<{ frame: number; dot?: number }> = ({ frame, dot = 16 }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: dot * 0.75,
        padding: "26px 32px",
        borderRadius: 28,
        borderBottomLeftRadius: 10,
        background: "rgba(250,250,250,0.6)",
        border: `1px solid rgba(10,10,10,0.05)`,
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.5)",
      }}
    >
      {[0, 1, 2].map((i) => {
        const phase = (((frame - i * 9) % DOT_PERIOD) + DOT_PERIOD) % DOT_PERIOD;
        
        const stops = [0, DOT_PERIOD * 0.35, DOT_PERIOD * 0.7, DOT_PERIOD];
        const ty = interpolate(phase, stops, [0, -dot * 0.45, 0, 0]);
        const scale = interpolate(phase, stops, [0.92, 1, 0.92, 0.92]);
        const op = interpolate(phase, stops, [0.35, 1, 0.35, 0.35]);
        return (
          <span
            key={i}
            style={{
              width: dot,
              height: dot,
              borderRadius: "50%",
              background: COLORS.accent,
              transform: `translateY(${ty}px) scale(${scale})`,
              opacity: op,
              display: "block",
            }}
          />
        );
      })}
    </div>
  );
};


export const Caret: React.FC<{ frame: number; height?: number; color?: string }> = ({
  frame,
  height = 38,
  color = COLORS.ink,
}) => {
  const on = frame % 60 < 30 ? 1 : 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: Math.max(2, height * 0.06),
        height,
        marginLeft: 3,
        transform: "translateY(4px)",
        background: color,
        opacity: on,
      }}
    />
  );
};

const Avatar: React.FC<{ kind: "user" | "ai" }> = ({ kind }) => (
  <div
    style={{
      width: 56,
      height: 56,
      borderRadius: "50%",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: kind === "user" ? SURFACE.accentSoft : SURFACE.bgSoft,
      border: `1px solid ${SURFACE.border}`,
    }}
  >
    {kind === "ai" ? (
      <SparkleIcon size={26} color={COLORS.accent} />
    ) : (
      <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill={COLORS.accent} />
        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill={COLORS.accent} />
      </svg>
    )}
  </div>
);
