import React from "react";
import { Composition, Still, continueRender, delayRender } from "remotion";
import { Cover } from "./Cover";
import { Reel } from "./Reel";
import { fontsReady } from "./theme";
import { TL } from "./timeline";

const handle = delayRender("fonts");
fontsReady.then(() => continueRender(handle));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);
