
import React from "react";
import { AbsoluteFill } from "remotion";

export const LightStage: React.FC = () => (
  <>
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }} />
    <AbsoluteFill style={{ backgroundColor: "rgba(10,10,10,0.08)" }} />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(70% 70% at 50% 44%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%), radial-gradient(40% 40% at 50% 42%, rgba(220,38,38,0.10) 0%, rgba(220,38,38,0) 70%)",
      }}
    />
  </>
);
