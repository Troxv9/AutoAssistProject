
import React from "react";
import { interpolate } from "remotion";
import { SURFACE, FONTS } from "../theme";

export const ParameterTable: React.FC<{
  leftHead: string;
  rightHead: string;
  rows: readonly { label: string; left: string; right: string }[];
  reveal: number;
}> = ({ leftHead, rightHead, rows, reveal }) => {
  return (
    <div
      style={{
        background: SURFACE.bg,
        borderRadius: 20,
        border: `1px solid ${SURFACE.border}`,
        boxShadow: "0 20px 50px -34px rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}
    >
      
      <Row
        cells={["მახასიათებელი", leftHead, rightHead]}
        head
      />
      {rows.map((r, i) => {
        const op = interpolate(reveal, [i * 0.12, i * 0.12 + 0.4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const y = interpolate(op, [0, 1], [12, 0]);
        return (
          <div key={r.label} style={{ opacity: op, transform: `translateY(${y}px)` }}>
            <Row cells={[r.label, r.left, r.right]} last={i === rows.length - 1} />
          </div>
        );
      })}
    </div>
  );
};

const Row: React.FC<{ cells: string[]; head?: boolean; last?: boolean }> = ({
  cells,
  head = false,
  last = false,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1.2fr 1.2fr",
      alignItems: "center",
      padding: "18px 26px",
      borderBottom: last ? "none" : `1px solid ${SURFACE.border}`,
      background: head ? SURFACE.bgSoft : SURFACE.bg,
    }}
  >
    <span
      style={{
        fontFamily: FONTS.sans,
        fontSize: head ? 16 : 21,
        fontWeight: head ? 700 : 600,
        letterSpacing: head ? 1 : 0,
        textTransform: head ? "uppercase" : "none",
        color: head ? SURFACE.inkFaint : SURFACE.ink,
      }}
    >
      {cells[0]}
    </span>
    <span
      style={{
        fontFamily: FONTS.sans,
        fontSize: head ? 16 : 20,
        fontWeight: head ? 700 : 500,
        color: head ? SURFACE.inkFaint : SURFACE.inkSoft,
      }}
    >
      {cells[1]}
    </span>
    <span
      style={{
        fontFamily: FONTS.sans,
        fontSize: head ? 16 : 20,
        fontWeight: head ? 700 : 500,
        color: head ? SURFACE.inkFaint : SURFACE.inkSoft,
      }}
    >
      {cells[2]}
    </span>
  </div>
);
