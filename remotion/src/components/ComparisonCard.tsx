
import React from "react";
import { interpolate } from "remotion";
import { SURFACE, FONTS } from "../theme";
import { CheckIcon, WarnIcon } from "./Icons";

export const ComparisonCard: React.FC<{
  title: string;
  brand: string;
  pros: readonly string[];
  cons: readonly string[];
  reveal: number;
  winner?: boolean;
}> = ({ title, brand, pros, cons, reveal, winner = false }) => {
  const rows = [
    ...pros.map((t) => ({ t, kind: "pro" as const })),
    ...cons.map((t) => ({ t, kind: "con" as const })),
  ];

  return (
    <div
      style={{
        flex: 1,
        background: SURFACE.bg,
        borderRadius: 20,
        border: winner ? `1.5px solid ${SURFACE.success}` : `1px solid ${SURFACE.border}`,
        boxShadow: winner
          ? "0 24px 60px -34px rgba(22,163,74,0.45)"
          : "0 20px 50px -34px rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}
    >
      
      <div
        style={{
          padding: "22px 26px",
          borderBottom: `1px solid ${SURFACE.border}`,
          background: winner ? SURFACE.successSoft : SURFACE.bgSoft,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: FONTS.sans, fontSize: 27, fontWeight: 700, color: SURFACE.ink }}>
          {title}
        </span>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 15,
            letterSpacing: 2,
            padding: "5px 12px",
            borderRadius: 999,
            background: winner ? SURFACE.success : SURFACE.bgSunken,
            color: winner ? "#fff" : SURFACE.inkSoft,
          }}
        >
          {brand}
        </span>
      </div>

      
      <div style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 15 }}>
        {rows.map((r, i) => {
          const op = interpolate(reveal, [i * 0.09, i * 0.09 + 0.3], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(op, [0, 1], [14, 0]);
          return (
            <div
              key={r.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                opacity: op,
                transform: `translateX(${x}px)`,
              }}
            >
              {r.kind === "pro" ? <CheckIcon size={24} /> : <WarnIcon size={24} />}
              <span style={{ fontFamily: FONTS.sans, fontSize: 21, color: SURFACE.inkSoft, lineHeight: 1.3 }}>
                {r.t}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
