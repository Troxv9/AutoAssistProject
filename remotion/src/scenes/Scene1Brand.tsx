
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SURFACE, FONTS, DATA } from "../theme";
import { AutoAssistMark, AutoAssistWordmark } from "../components/AutoAssistLogo";
import { LightStage } from "../components/LightStage";
import { EASE, focusPull, blurCss, idleFloat } from "../motion";

const RED = "#DC2626";

export const Scene1Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 18, mass: 0.7, stiffness: 170 } });
  const groupScale = interpolate(pop, [0, 1], [0.92, 1]);
  const drift = idleFloat(frame, 0, 3);

  const mark = focusPull(frame, fps, 0, {
    distance: 0,
    blur: 10,
    scaleFrom: 0.5,
    config: { damping: 13, mass: 0.6, stiffness: 190 },
  });
  const markRotate = interpolate(mark.progress, [0, 1], [-16, 0]);

  const wordSpring = spring({ frame: frame - 6, fps, config: { damping: 22, mass: 0.8, stiffness: 150 } });
  const wordClip = interpolate(wordSpring, [0, 1], [100, 0], { extrapolateRight: "clamp" });
  const wordY = interpolate(wordSpring, [0, 1], [22, 0]);
  const wordOpacity = interpolate(wordSpring, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  const linePct = interpolate(frame, [22, 52], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outExpo,
  });

  const sweepX = interpolate(frame, [40, 84], [-30, 150], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOutQuint,
  });
  const sweepOpacity = interpolate(frame, [40, 50, 76, 84], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const head = focusPull(frame, fps, 20, { distance: 26, blur: 10 });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <LightStage />

      <div
        style={{
          transform: `scale(${groupScale}) translate(${drift.x}px, ${drift.y}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          position: "relative",
        }}
      >
        
        <div style={{ display: "flex", alignItems: "center", gap: 30, position: "relative" }}>
          <div
            style={{
              transform: `rotate(${markRotate}deg) scale(${mark.scale})`,
              opacity: mark.opacity,
              filter: blurCss(mark.blur),
            }}
          >
            <AutoAssistMark size={132} />
          </div>

          <div
            style={{
              transform: `translateY(${wordY}px)`,
              opacity: wordOpacity,
              clipPath: `inset(0 ${wordClip}% 0 0)`,
              WebkitClipPath: `inset(0 ${wordClip}% 0 0)`,
            }}
          >
            <AutoAssistWordmark size={128} />
          </div>

          
          <div
            style={{
              position: "absolute",
              inset: -30,
              pointerEvents: "none",
              opacity: sweepOpacity * 0.6,
              background: `linear-gradient(115deg, transparent ${sweepX - 12}%, rgba(255,255,255,0.85) ${sweepX}%, transparent ${sweepX + 12}%)`,
              mixBlendMode: "overlay",
            }}
          />
        </div>

        
        <div
          style={{
            width: `${linePct}%`,
            maxWidth: 560,
            height: 4,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${RED}, #EF4444)`,
            boxShadow: "0 4px 16px -4px rgba(220,38,38,0.5)",
          }}
        />

        
        <div
          style={{
            transform: `translateY(${head.y}px)`,
            opacity: head.opacity,
            filter: blurCss(head.blur),
            fontFamily: FONTS.sans,
            fontSize: 40,
            fontWeight: 600,
            color: SURFACE.ink,
            textAlign: "center",
            letterSpacing: -0.5,
          }}
        >
          {renderHeadline(DATA.hook.headline)}
        </div>
      </div>
    </AbsoluteFill>
  );
};


const renderHeadline = (text: string) => {
  const accents = ["Copart", "IAAI", "autopapa.ge"];
  const parts = text.split(/(Copart|IAAI|autopapa\.ge)/g);
  return parts.map((p, i) =>
    accents.includes(p) ? (
      <span key={i} style={{ color: RED, fontWeight: 800 }}>
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
};
