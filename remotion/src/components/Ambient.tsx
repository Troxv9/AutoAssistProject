
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const Ambient: React.FC<{ intensity?: number }> = ({
  intensity = 1,
}) => {
  const frame = useCurrentFrame();

  const ax = 50 + Math.sin(frame / 190) * 14;
  const ay = 38 + Math.cos(frame / 240) * 10;
  const bx = 50 + Math.cos(frame / 210 + 2) * 16;
  const by = 66 + Math.sin(frame / 260 + 1) * 9;

  const breathe = 0.85 + Math.sin(frame / 90) * 0.15;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 700px at ${ax}% ${ay}%, rgba(220,38,38,${0.10 * intensity * breathe}) 0%, rgba(220,38,38,0) 65%)`,
        }}
      />
      
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 800px at ${bx}% ${by}%, rgba(255,255,255,${0.035 * intensity}) 0%, rgba(255,255,255,0) 60%)`,
        }}
      />
      
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(75% 75% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(75% 75% at 50% 50%, black 30%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
