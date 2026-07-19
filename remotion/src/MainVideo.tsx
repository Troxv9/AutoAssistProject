
import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { COLORS } from "./theme";
import { Grain } from "./components/Grain";
import { Scene1Brand } from "./scenes/Scene1Brand";
import { Scene2Analysis } from "./scenes/Scene2Analysis";
import { Scene3Comparison } from "./scenes/Scene3Comparison";
import { Scene4Chat } from "./scenes/Scene4Chat";

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.base }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene1Brand />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 28 })}
          presentation={fade()}
        />

        <TransitionSeries.Sequence durationInFrames={300}>
          <Scene2Analysis />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          timing={springTiming({ config: { damping: 26, mass: 1, stiffness: 90 }, durationInFrames: 32 })}
          presentation={slide({ direction: "from-right" })}
        />

        <TransitionSeries.Sequence durationInFrames={330}>
          <Scene3Comparison />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 32 })}
          presentation={fade()}
        />

        <TransitionSeries.Sequence durationInFrames={214}>
          <Scene4Chat />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
