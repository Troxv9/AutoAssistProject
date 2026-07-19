
import React from "react";

export const CheckIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = "#16A34A",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={color} opacity={0.12} />
    <path
      d="M7 12.5l3.2 3.2L17 9"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const WarnIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = "#DC2626",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3.2l9 15.6a1 1 0 0 1-.87 1.5H3.87A1 1 0 0 1 3 18.8L12 3.2z"
      fill={color}
      opacity={0.12}
    />
    <path
      d="M12 9v4.4"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16.6" r="1.25" fill={color} />
  </svg>
);

export const CarGlyph: React.FC<{ size?: number; color?: string }> = ({
  size = 60,
  color = "#fff",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 13l1.6-4.2A3 3 0 0 1 7.4 7h9.2a3 3 0 0 1 2.8 1.8L21 13v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-4z"
      stroke={color}
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="rgba(255,255,255,0.14)"
    />
    <path d="M4.6 13h14.8" stroke={color} strokeWidth="1.4" />
  </svg>
);

export const SparkleIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = "#DC2626",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"
      fill={color}
    />
  </svg>
);
