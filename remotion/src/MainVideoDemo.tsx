
import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

import { Grain } from "./components/Grain";
import { Scene1Brand } from "./scenes/Scene1Brand";
import { SceneSiteDemo } from "./scenes/SceneSiteDemo";

export const MainVideoDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene1Brand />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
          presentation={fade()}
        />

        <TransitionSeries.Sequence durationInFrames={655}>
          <SceneSiteDemo />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};
