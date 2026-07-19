import React, { useMemo } from "react";
import { AbsoluteFill, random } from "remotion";

export const Grain: React.FC<{ opacity?: number; seed?: string; count?: number }> = ({
  opacity = 0.06,
  seed = "auto-assist-grain",
  count = 220,
}) => {
  const dots = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => ({
      key: i,
      left: random(`${seed}-x-${i}`) * 100,
      top: random(`${seed}-y-${i}`) * 100,
      size: 0.5 + random(`${seed}-s-${i}`) * 1.4,
      a: 0.2 + random(`${seed}-a-${i}`) * 0.8,
    }));
  }, [seed, count]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(130% 130% at 50% 50%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.30) 100%)",
        }}
      />

      <AbsoluteFill style={{ opacity }}>
        {dots.map((d) => (
          <div
            key={d.key}
            style={{
              position: "absolute",
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: d.size,
              height: d.size,
              borderRadius: "50%",
              background: `rgba(255,255,255,${d.a})`,
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
