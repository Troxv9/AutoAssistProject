
import React from "react";
import { interpolate } from "remotion";

const PETAL_PATH =
  "M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z";

const RED = "#DC2626";
const PERIOD = 60;
const STOPS = [0, 0.25, 0.5, 0.75, 1];

type Track = {
  scale: number[];
  ty: number[];
  tx: number[];
  rz: number[];
  op: number[];
  delay: number;
};

const ONE: Track = {
  scale: [0.5, 0.75, 1, 0.5, 0],
  ty: [-200, -100, 0, 50, 100],
  tx: [0, 0, 0, 0, 0],
  rz: [0, 0, 0, 0, 0],
  op: [0, 1, 1, 1, 0],
  delay: 0,
};
const TWO: Track = {
  scale: [0.5, 1, 1, 0.5, 0],
  ty: [-200, -100, 0, 50, 100],
  tx: [-100, -50, -25, 0, 25],
  rz: [-10, -5, 0, 5, 10],
  op: [0, 1, 1, 1, 0],
  delay: 18,
};
const THREE: Track = {
  scale: [0.5, 1, 1, 0.5, 0],
  ty: [-200, -100, 0, 50, 100],
  tx: [100, 50, 25, 0, -25],
  rz: [10, 5, 0, -5, -10],
  op: [0, 1, 1, 1, 0],
  delay: 36,
};

const trackStyle = (frame: number, t: Track): React.CSSProperties => {
  const phase = (((frame - t.delay) % PERIOD) + PERIOD) % PERIOD / PERIOD;
  const scale = interpolate(phase, STOPS, t.scale);
  const ty = interpolate(phase, STOPS, t.ty);
  const tx = interpolate(phase, STOPS, t.tx);
  const rz = interpolate(phase, STOPS, t.rz);
  const op = interpolate(phase, STOPS, t.op);
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "visible",
    opacity: op,
    transform: `scale(${scale}) rotateZ(${rz}deg) translateY(${ty}px) translateX(${tx}px)`,
  };
};

const PegtopSvg: React.FC<{ uid: string; style?: React.CSSProperties }> = ({ uid, style }) => {
  const shine = `${uid}-shine`;
  const mask = `${uid}-mask`;
  const g1 = `${uid}-g1`;
  const g2 = `${uid}-g2`;
  const g3 = `${uid}-g3`;
  const g4 = `${uid}-g4`;
  const g5 = `${uid}-g5`;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true" style={style}>
      <defs>
        <filter id={shine}>
          <feGaussianBlur stdDeviation={3} />
        </filter>
        <mask id={mask}>
          <path d={PETAL_PATH} fill="white" />
        </mask>
        <radialGradient id={g1} cx={50} cy={66} fx={50} fy={66} r={30} gradientTransform="translate(0 35) scale(1 0.5)" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="black" stopOpacity="0.3" />
          <stop offset="50%" stopColor="black" stopOpacity="0.1" />
          <stop offset="100%" stopColor="black" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={g2} cx={55} cy={20} fx={55} fy={20} r={30} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="50%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={g3} cx={85} cy={50} fx={85} fy={50} href={`#${g2}`} />
        <radialGradient id={g4} cx={50} cy={58} fx={50} fy={58} r={60} gradientTransform="translate(0 47) scale(1 0.2)" href={`#${g3}`} />
        <linearGradient id={g5} x1={50} y1={90} x2={50} y2={10} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="black" stopOpacity="0.2" />
          <stop offset="40%" stopColor="black" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g>
        <path d={PETAL_PATH} fill={RED} />
        <path d={PETAL_PATH} fill={`url(#${g1})`} />
        <path d={PETAL_PATH} fill="none" stroke="white" opacity="0.3" strokeWidth={3} filter={`url(#${shine})`} mask={`url(#${mask})`} />
        <path d={PETAL_PATH} fill={`url(#${g2})`} />
        <path d={PETAL_PATH} fill={`url(#${g3})`} />
        <path d={PETAL_PATH} fill={`url(#${g4})`} />
        <path d={PETAL_PATH} fill={`url(#${g5})`} />
      </g>
    </svg>
  );
};


export const PegtopLoader: React.FC<{ frame: number; size?: number; glow?: number }> = ({
  frame,
  size = 72,
  glow = 0.45,
}) => {
  const uid = React.useId().replace(/:/g, "");
  return (
    <div
      style={{
        position: "relative",
        width: 72,
        height: 72,
        flexShrink: 0,
        overflow: "visible",
        transform: `scale(${size / 72})`,
        transformOrigin: "center center",
        filter: `drop-shadow(0 0 ${14 * glow}px rgba(220,38,38,${0.5 * glow}))`,
      }}
    >
      <PegtopSvg uid={`${uid}-1`} style={trackStyle(frame, ONE)} />
      <PegtopSvg uid={`${uid}-2`} style={trackStyle(frame, TWO)} />
      <PegtopSvg uid={`${uid}-3`} style={trackStyle(frame, THREE)} />
    </div>
  );
};
