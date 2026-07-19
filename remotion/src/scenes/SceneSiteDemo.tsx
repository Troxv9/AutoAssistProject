
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../motion";
import { Cursor } from "../components/Cursor";
import { PageContent, type FormState } from "../site/Browser";
import { LightStage } from "../components/LightStage";

const URL1 = "https://www.copart.com/lot/59139296/clean-title-2025-kia-k4-lxs-hi-honolulu";

const SCROLL_MAX = 1080;

const T_FAB = { x: 1860, y: 1020 };
const T_CTA = { x: 1615, y: 900 };
const T_INPUT = { x: 700, y: 1572 };
const T_BUTTON = { x: 960, y: 1658 };

const kf = (frame: number, t: number[], v: number[], easing = EASE.inOutQuint) =>
  interpolate(frame, t, v, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

const clickPulse = (frame: number, center: number, dur = 20) =>
  frame >= center && frame <= center + dur ? (frame - center) / dur : 0;

export const SceneSiteDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const T = [0, 70, 150, 200, 320, 360, 470, 520, 610, 655];
  const Z = kf(frame, T, [1.02, 1.0, 1.9, 1.85, 1.85, 1.0, 1.0, 1.45, 1.45, 1.45]);
  const fx = kf(frame, T, [960, 960, 1640, 1678, 1678, 960, 960, 960, 960, 960]);
  const fy = kf(frame, T, [540, 540, 780, 696, 696, 540, 540, 535, 535, 535]);
  const driftX = Math.sin(frame * 0.02) * 4;
  const driftY = Math.cos(frame * 0.017) * 3;
  const camX = 960 - Z * fx + driftX;
  const camY = 540 - Z * fy + driftY;

  const scrollY = kf(frame, [360, 470], [0, SCROLL_MAX], EASE.inOutQuint);

  const chatOpen =
    frame < 340 ? kf(frame, [158, 200], [0, 1], EASE.outBack) : kf(frame, [340, 362], [1, 0], EASE.inOutQuint);
  const ctaHighlight = kf(frame, [262, 272, 300], [0, 1, 0], EASE.outExpo);

  const PASTE = 540;
  const focus = kf(frame, [500, 508, 575, 585], [0, 1, 1, 0], EASE.outExpo);
  const flash = kf(frame, [PASTE, PASTE + 8, PASTE + 26], [0, 1, 0], EASE.outExpo);
  const btnPress = kf(frame, [588, 596, 610], [0, 1, 0], EASE.outExpo);

  const form: FormState = {
    url: frame >= PASTE ? URL1 : "",
    focus,
    flash,
    caretOn: Math.floor(frame / 16) % 2 === 0,
    btnPress,
  };

  const ct = [0, 70, 150, 205, 255, 300, 360, 470, 500, 545, 575, 588, 655];
  const cbx = kf(frame, ct, [980, 980, T_FAB.x, 1858, T_CTA.x, T_CTA.x, 1500, 1000, T_INPUT.x, T_INPUT.x, T_BUTTON.x, T_BUTTON.x, T_BUTTON.x], EASE.outExpo);
  const cby = kf(frame, ct, [780, 780, T_FAB.y, 1015, T_CTA.y, T_CTA.y, 800, 1460, T_INPUT.y, T_INPUT.y, T_BUTTON.y, T_BUTTON.y, T_BUTTON.y], EASE.outExpo);
  const cursorX = camX + cbx * Z;
  const cursorY = camY - scrollY * Z + cby * Z;
  const cursorOp = kf(frame, [0, 25, 300, 340, 455, 478, 606, 626], [0, 1, 1, 0, 0, 1, 1, 0], EASE.outExpo);
  const click =
    clickPulse(frame, 155) +
    clickPulse(frame, 268) +
    clickPulse(frame, 508) +
    clickPulse(frame, 588);

  const stageOpacity = kf(frame, [614, 654], [0, 1], EASE.inOutQuint);

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#FFFFFF" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 2160,
          transform: `translate(${camX}px, ${camY - scrollY * Z}px) scale(${Z})`,
          transformOrigin: "0 0",
        }}
      >
        <PageContent form={form} chatOpen={chatOpen} ctaHighlight={ctaHighlight} />
      </div>

      <Cursor x={cursorX} y={cursorY} click={click} opacity={cursorOp} />

      
      <AbsoluteFill style={{ opacity: stageOpacity }}>
        <LightStage />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
