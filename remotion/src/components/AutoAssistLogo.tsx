
import React from "react";
import { FONTS, COLORS } from "../theme";

const INK = "#0A0A0A";
const RED = "#DC2626";

export const AutoAssistMark: React.FC<{ size?: number; dark?: boolean; slash?: string }> = ({
  size = 96,
  dark = false,
  slash = "white",
}) => {
  const ink = dark ? "#FFFFFF" : INK;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 4L4 26H9L16 11.5L23 26H28L16 4Z" fill={ink} />
      <path d="M16 10L9 23H13L16 17L19 23H23L16 10Z" fill={RED} />
      <rect x="3" y="19" width="26" height="1.5" fill={slash} transform="rotate(-5 16 19.75)" />
    </svg>
  );
};

export const AutoAssistWordmark: React.FC<{
  size?: number;
  dark?: boolean;
}> = ({ size = 92, dark = false }) => (
  <span
    style={{
      fontFamily: FONTS.sans,
      fontSize: size,
      letterSpacing: -size * 0.025,
      lineHeight: 1,
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ color: dark ? COLORS.ink : INK, fontWeight: 700 }}>Auto</span>
    <span style={{ color: RED, fontWeight: 600 }}>Assist</span>
  </span>
);

export const AutoAssistLogo: React.FC<{
  size?: number;
  dark?: boolean;
  gap?: number;
}> = ({ size = 92, dark = false, gap }) => (
  <div style={{ display: "flex", alignItems: "center", gap: gap ?? size * 0.28 }}>
    <AutoAssistMark size={size} dark={dark} />
    <AutoAssistWordmark size={size} dark={dark} />
  </div>
);
