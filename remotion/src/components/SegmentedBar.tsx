
import React from "react";
import { interpolate } from "remotion";
import { SURFACE, FONTS } from "../theme";

const SEGMENT_COLORS = [
  "#DC2626",
  "#E7503B",
  "#B91C1C",
  "#F0654B",
  "#7F1D1D",
  "#9A9A9A",
  "#B8B8B8",
  "#CFCFCF",
  "#E2E2E2",
];

export const SegmentedBar: React.FC<{
  title: string;
  hint: string;
  segments: readonly { label: string; pct: number }[];
  grow: number;
}> = ({ title, hint, segments, grow }) => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: FONTS.sans, fontSize: 30, fontWeight: 700, color: SURFACE.ink }}>
          {title}
        </span>
        <span style={{ fontFamily: FONTS.sans, fontSize: 19, color: SURFACE.inkFaint }}>{hint}</span>
      </div>

      <div
        style={{
          display: "flex",
          height: 26,
          borderRadius: 13,
          overflow: "hidden",
          marginTop: 22,
          background: SURFACE.bgSunken,
        }}
      >
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{
              width: `${s.pct * grow}%`,
              background: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
              height: "100%",
              borderRight: i < segments.length - 1 ? "1.5px solid rgba(255,255,255,0.9)" : "none",
            }}
          />
        ))}
      </div>

      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 26px", marginTop: 22 }}>
        {segments.map((s, i) => {
          const op = interpolate(grow, [0.3 + i * 0.05, 0.55 + i * 0.05], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontFamily: FONTS.sans,
                fontSize: 19,
                color: SURFACE.inkSoft,
                opacity: op,
              }}
            >
              <i
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                }}
              />
              {s.label}
              <b style={{ fontFamily: FONTS.mono, color: SURFACE.ink, fontWeight: 700 }}>{s.pct}%</b>
            </span>
          );
        })}
      </div>
    </div>
  );
};
