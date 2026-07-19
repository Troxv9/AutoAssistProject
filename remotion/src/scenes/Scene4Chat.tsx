
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SURFACE, FONTS, DATA, COLORS } from "../theme";
import { LightStage } from "../components/LightStage";
import { AutoAssistMark } from "../components/AutoAssistLogo";
import { PegtopLoader } from "../components/PegtopLoader";
import { UserBubble, TypingDots, Caret } from "../components/Chat";
import { focusPull, blurCss, EASE } from "../motion";

const QUESTION = DATA.chat.question;
const CHARS = Array.from(QUESTION);
const LEN = CHARS.length;

const TYPE_START = 18;
const TYPE_END = 90;
const SEND = 98;
const THINK_START = 122;
const DURATION = 214;

export const Scene4Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = focusPull(frame, fps, 0, { distance: 46, blur: 16, scaleFrom: 0.96 });

  const charsShown = Math.round(
    interpolate(frame, [TYPE_START, TYPE_END], [0, LEN], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const typed = CHARS.slice(0, charsShown).join("");
  const isTyping = frame >= TYPE_START && frame < SEND;
  const sent = frame >= SEND;

  const canSend = typed.length > 0 && !sent;
  const pressPulse = interpolate(frame, [SEND, SEND + 6, SEND + 14], [1, 0.86, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bubble = spring({ frame: frame - SEND, fps, config: { damping: 15, mass: 0.7, stiffness: 150 } });
  const bubbleY = interpolate(bubble, [0, 1], [46, 0]);
  const bubbleScale = interpolate(bubble, [0, 1], [0.92, 1]);

  const think = spring({ frame: frame - THINK_START, fps, config: { damping: 22, stiffness: 110 } });
  const thinkY = interpolate(think, [0, 1], [22, 0]);

  const baseZoom = interpolate(frame, [0, DURATION], [1.0, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outQuint,
  });
  const climbZoom = interpolate(frame, [138, 196], [0, 0.13], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOutQuint,
  });
  const zoom = baseZoom + climbZoom;
  const camY = interpolate(frame, [138, 196], [0, -60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOutQuint,
  });

  const fadeOut = interpolate(frame, [DURATION - 22, DURATION - 3], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <LightStage />

      <div
        style={{
          opacity: fadeOut,
          transform: `translateY(${camY}px) scale(${zoom})`,
        }}
      >
        <div
          style={{
            transform: `translateY(${cardIn.y}px) scale(${cardIn.scale})`,
            opacity: cardIn.opacity,
            filter: blurCss(cardIn.blur),
            width: 1060,
            borderRadius: 30,
            background: SURFACE.bg,
            border: `1px solid ${SURFACE.border}`,
            boxShadow: "0 50px 130px -50px rgba(0,0,0,0.4), 0 10px 30px -16px rgba(0,0,0,0.18)",
            overflow: "hidden",
          }}
        >
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "22px 30px",
              borderBottom: `1px solid ${SURFACE.border}`,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 15,
                background: SURFACE.accentSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoAssistMark size={28} />
            </div>
            <div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 24, fontWeight: 800, color: SURFACE.ink, lineHeight: 1.1 }}>
                Auto<span style={{ color: SURFACE.accent }}>Assist</span>
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 17, color: SURFACE.inkFaint }}>
                {DATA.chat.assistant}
              </div>
            </div>
          </div>

          
          <div style={{ padding: "34px 40px", minHeight: 360, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 34 }}>
            
            {sent && (
              <div style={{ transform: `translateY(${bubbleY}px) scale(${bubbleScale})`, opacity: bubble, transformOrigin: "right bottom" }}>
                <UserBubble text={QUESTION} time={DATA.chat.time} progress={bubble} />
              </div>
            )}

            
            {frame >= THINK_START && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: think,
                  transform: `translateY(${thinkY}px)`,
                }}
              >
                <PegtopLoader frame={frame} size={40} glow={0.5} />
                <TypingDots frame={frame} />
              </div>
            )}
          </div>

          
          <div style={{ padding: "0 30px 30px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderRadius: 34,
                border: `1px solid ${canSend ? "rgba(220,38,38,0.3)" : SURFACE.border}`,
                background: SURFACE.bg,
                padding: "12px 12px 12px 26px",
                boxShadow: canSend
                  ? "0 0 0 3px rgba(220,38,38,0.10), 0 1px 2px rgba(10,10,10,0.04)"
                  : "0 1px 2px rgba(10,10,10,0.04)",
              }}
            >
              <div style={{ flex: 1, minHeight: 44, display: "flex", alignItems: "center" }}>
                {typed.length === 0 && !isTyping ? (
                  <span style={{ fontFamily: FONTS.sans, fontSize: 30, color: SURFACE.inkFaint }}>
                    {sent ? DATA.chat.placeholder : ""}
                    {!sent && <Caret frame={frame} height={38} color={COLORS.accent} />}
                  </span>
                ) : (
                  <span style={{ fontFamily: FONTS.sans, fontSize: 30, color: SURFACE.ink, lineHeight: 1.3 }}>
                    {typed}
                    {isTyping && <Caret frame={frame} height={38} color={COLORS.accent} />}
                  </span>
                )}
              </div>

              
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: canSend ? COLORS.accent : SURFACE.bgSunken,
                  boxShadow: canSend ? "0 6px 18px rgba(220,38,38,0.32)" : "none",
                  transform: `scale(${pressPulse})`,
                }}
              >
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 19V5 M5 12l7-7 7 7"
                    stroke={canSend ? "#fff" : SURFACE.inkFaint}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
