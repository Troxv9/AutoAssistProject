
import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SURFACE, FONTS, redGlow } from "../theme";
import { Ambient } from "../components/Ambient";
import { EASE, focusPull, blurCss } from "../motion";

const IMG_W = 1520;
const IMG_H = Math.round((IMG_W * 470) / 1760);

export const Scene3Comparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const header = focusPull(frame, fps, 6, { distance: 20, blur: 8 });
  const shot = focusPull(frame, fps, 16, { distance: 44, blur: 18, scaleFrom: 0.95 });

  const drift = interpolate(frame, [0, 330], [1, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outQuint,
  });
  const glow = interpolate(frame, [10, 60], [0, 0.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.base, justifyContent: "center", alignItems: "center" }}
    >
      <Ambient intensity={0.6} />
      <AbsoluteFill style={{ background: redGlow(1200, glow) }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div
          style={{
            transform: `translateY(${header.y}px)`,
            opacity: header.opacity,
            filter: blurCss(header.blur),
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: SURFACE.accent,
            }}
          >
            პირისპირ შედარება
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 46, fontWeight: 800, color: COLORS.ink, letterSpacing: -1, marginTop: 8 }}>
            ორი გზა · სრული სურათი
          </div>
        </div>

        
        <div
          style={{
            transform: `translateY(${shot.y}px) scale(${shot.scale * drift})`,
            opacity: shot.opacity,
            filter: blurCss(shot.blur),
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 40px 120px -40px rgba(0,0,0,0.8)",
          }}
        >
          <Img
            src={staticFile("comparison1.png")}
            style={{ width: IMG_W, height: IMG_H, display: "block" }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
