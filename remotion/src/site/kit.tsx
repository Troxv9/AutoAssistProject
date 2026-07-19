
import React from "react";

export const C = {
  bg: "#FFFFFF",
  fg: "#0A0A0A",
  card: "#FFFFFF",
  primary: "#DC2626",
  primaryFg: "#FFFFFF",
  secondary: "#F5F5F5",
  secondaryFg: "#171717",
  muted: "#FAFAFA",
  mutedFg: "#737373",
  accent: "#FEF2F2",
  accentFg: "#7F1D1D",
  ring: "#EF4444",
  border: "rgba(10,10,10,0.08)",
  border60: "rgba(10,10,10,0.06)",
  border15: "rgba(10,10,10,0.15)",
} as const;

export const FONT = {
  sans: `"Noto Sans Georgian", "Inter", system-ui, sans-serif`,
  mono: `"JetBrains Mono", "Noto Sans Georgian", ui-monospace, monospace`,
} as const;

export const SHADOW_ELEVATED = "0 24px 80px -32px rgba(10,10,10,0.12)";

type IconProps = { size?: number; color?: string; strokeWidth?: number; fill?: string };

const Svg: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  fill = "none",
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

export const ArrowRight: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Svg>
);

export const ArrowUp: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </Svg>
);

export const ArrowLeftRight: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 3 4 7l4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </Svg>
);

export const Link2: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <path d="M8 12h8" />
  </Svg>
);

export const Check: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const ChevronDown: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const X: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

export const MessageCircle: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </Svg>
);

export const MoreHorizontal: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
    <circle cx="5" cy="12" r="1.6" />
  </svg>
);

export const AAMark: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4L4 26H9L16 11.5L23 26H28L16 4Z" fill={C.fg} />
    <path d="M16 10L9 23H13L16 17L19 23H23L16 10Z" fill={C.primary} />
    <rect x="3" y="19" width="26" height="1.5" fill="white" transform="rotate(-5 16 19.75)" />
  </svg>
);

export const AAWordmark: React.FC<{ fontSize?: number }> = ({ fontSize = 16 }) => (
  <span style={{ fontFamily: FONT.sans, fontSize, letterSpacing: -0.4, lineHeight: 1, whiteSpace: "nowrap" }}>
    <span style={{ color: C.fg, fontWeight: 700 }}>Auto</span>
    <span style={{ color: C.primary, fontWeight: 600 }}>Assist</span>
  </span>
);
