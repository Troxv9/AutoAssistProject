
import React from "react";
import { SURFACE, FONTS } from "../theme";
import { AutoAssistMark } from "./AutoAssistLogo";

export const BrowserFrame: React.FC<{
  title?: string;
  width?: number | string;
  radius?: number;
  chrome?: boolean;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  title = "autoassist.ge",
  width = 1180,
  radius = 22,
  chrome = true,
  style,
  bodyStyle,
  children,
}) => {
  return (
    <div
      style={{
        width,
        borderRadius: radius,
        background: SURFACE.bg,
        border: `1px solid ${SURFACE.border}`,
        boxShadow: SURFACE.shadow,
        overflow: "hidden",
        ...style,
      }}
    >
      
      {chrome && (
        <div
          style={{
            height: 54,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 24px",
            borderBottom: `1px solid ${SURFACE.border}`,
            background: SURFACE.bg,
          }}
        >
          <AutoAssistMark size={24} />
          <span style={{ fontFamily: FONTS.sans, fontSize: 18, fontWeight: 800, color: SURFACE.ink }}>
            Auto<span style={{ color: SURFACE.accent }}>Assist</span>
          </span>
          <div
            style={{
              marginLeft: "auto",
              height: 30,
              borderRadius: 999,
              background: SURFACE.bgSoft,
              border: `1px solid ${SURFACE.border}`,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: SURFACE.inkFaint,
            }}
          >
            {title}
          </div>
        </div>
      )}

      
      <div style={{ padding: 34, ...bodyStyle }}>{children}</div>
    </div>
  );
};
