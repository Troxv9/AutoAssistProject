
import React from "react";
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { MainVideoDemo } from "./MainVideoDemo";
import "./fonts";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AutoAssistLaunch"
        component={MainVideo}
        durationInFrames={892}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      <Composition
        id="AutoAssistDemo"
        component={MainVideoDemo}
        durationInFrames={765}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
