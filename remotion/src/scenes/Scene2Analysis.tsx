
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SURFACE, FONTS, DATA, gel } from "../theme";
import { Ambient } from "../components/Ambient";
import { BrowserFrame } from "../components/BrowserFrame";
import { SegmentedBar } from "../components/SegmentedBar";
import { EASE, focusPull, blurCss, countUp } from "../motion";

export const Scene2Analysis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const frameIn = focusPull(frame, fps, 0, { distance: 40, blur: 16, scaleFrom: 0.95 });
  const header = focusPull(frame, fps, 10, { distance: 22, blur: 8 });

  const grow = interpolate(frame, [30, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outExpo,
  });

  const fill = interpolate(frame, [120, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outExpo,
  });
  const importCount = Math.round(countUp(frame, DATA.importTotal, 120, 230));
  const localCount = Math.round(countUp(frame, DATA.localTotal, 120, 230));

  const summaryIn = spring({ frame: frame - 108, fps, config: { damping: 26, stiffness: 100 } });

  const importW = (DATA.importTotal / DATA.localTotal) * 100;

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.base, justifyContent: "center", alignItems: "center" }}
    >
      <Ambient intensity={0.7} />

      <div
        style={{
          transform: `translateY(${frameIn.y}px) scale(${frameIn.scale})`,
          opacity: frameIn.opacity,
          filter: blurCss(frameIn.blur),
        }}
      >
        <BrowserFrame width={1280} bodyStyle={{ padding: "40px 48px 46px" }}>
          
          <div
            style={{
              transform: `translateY(${header.y}px)`,
              opacity: header.opacity,
              filter: blurCss(header.blur),
              marginBottom: 30,
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
              ხარჯების ანალიზი
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 44, fontWeight: 800, color: SURFACE.ink, letterSpacing: -1, marginTop: 6 }}>
              იმპორტის სრული ღირებულება
            </div>
          </div>

          <SegmentedBar
            title="იმპორტის ხარჯების სტრუქტურა"
            hint="პროპორციული განაწილება"
            segments={DATA.costStructure}
            grow={grow}
          />

          
          <div
            style={{
              marginTop: 40,
              opacity: summaryIn,
              transform: `translateY(${interpolate(summaryIn, [0, 1], [20, 0])}px)`,
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <TotalBar
              label={DATA.copart.title}
              value={`₾ ${gel.format(importCount)}`}
              widthPct={importW * fill}
              accent
            />
            <TotalBar
              label={DATA.myauto.title}
              value={`₾ ${gel.format(localCount)}`}
              widthPct={100 * fill}
              accent={false}
            />
          </div>
        </BrowserFrame>
      </div>
    </AbsoluteFill>
  );
};

const TotalBar: React.FC<{ label: string; value: string; widthPct: number; accent: boolean }> = ({
  label,
  value,
  widthPct,
  accent,
}) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontFamily: FONTS.sans, fontSize: 24, fontWeight: 600, color: SURFACE.ink }}>{label}</span>
      <span style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700, color: accent ? SURFACE.success : SURFACE.ink }}>
        {value}
      </span>
    </div>
    <div style={{ height: 22, borderRadius: 11, background: SURFACE.bgSunken, overflow: "hidden" }}>
      <div
        style={{
          width: `${widthPct}%`,
          height: "100%",
          borderRadius: 11,
          background: accent
            ? `linear-gradient(90deg, ${SURFACE.success}, #22C55E)`
            : `linear-gradient(90deg, ${COLORS.accentDeep}, ${COLORS.accent})`,
        }}
      />
    </div>
  </div>
);
