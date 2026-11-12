import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOut } from "./anim";
import { Navigator } from "./character/Navigator";
import { Background, ProgressBar, Subtitles, Watermark } from "./components/common";
import { Consult } from "./scenes/Consult";
import { Ending } from "./scenes/Ending";
import { Hook } from "./scenes/Hook";
import { Ideas } from "./scenes/Ideas";
import { Problem } from "./scenes/Problem";
import { Truth } from "./scenes/Truth";
import { SceneId, TL } from "./timeline";

const SCENES: Record<SceneId, React.FC> = {
  hook: Hook,
  problem: Problem,
  consult: Consult,
  ideas: Ideas,
  truth: Truth,
  ending: Ending,
};

const OVERLAP = 8;

/** シーンの入り/出のトランジション（フレームベース） */
const SceneWrap: React.FC<React.PropsWithChildren<{ last: boolean }>> = ({ children, last }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inP = interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: easeOut });
  const outP = last ? 0 : interpolate(frame, [durationInFrames - OVERLAP - 4, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(inP, 1 - outP),
        translate: `0px ${(1 - inP) * 50 - outP * 50}px`,
        filter: outP > 0 ? `blur(${outP * 8}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#061233" }}>
      <Background />
      {TL.scenes.map((s, i) => {
        const Comp = SCENES[s.id as SceneId];
        const last = i === TL.scenes.length - 1;
        return (
          <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.duration + (last ? 0 : OVERLAP)} layout="none">
            <SceneWrap last={last}>
              <Comp />
            </SceneWrap>
          </Sequence>
        );
      })}
      <Navigator />
      <Subtitles />
      <ProgressBar />
      <Watermark />
      <Audio src={staticFile("audio/master.wav")} />
    </AbsoluteFill>
  );
};
