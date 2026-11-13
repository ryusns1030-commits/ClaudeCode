import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOut } from "../../../src/anim";
import { Background, ProgressBar, Subtitles, Watermark } from "./layout";
import { Navigator } from "./Navigator";
import { Check, Conclusion, Ending, Experience, Hook, Prompt } from "./scenes";
import { SceneId, SLUG, TL } from "./tl";

const SCENES: Record<SceneId, React.FC> = {
  hook: Hook,
  experience: Experience,
  prompt: Prompt,
  check: Check,
  conclusion: Conclusion,
  ending: Ending,
};

const OVERLAP = 8;

/** シーンのクロスフェード（既存 Reel.tsx と同じ方式） */
const SceneWrap: React.FC<React.PropsWithChildren<{ last: boolean; first: boolean }>> = ({ children, last, first }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inP = first ? 1 : interpolate(frame, [0, 12], [0, 1], { ...clamp, easing: easeOut });
  const outP = last ? 0 : interpolate(frame, [durationInFrames - OVERLAP - 4, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: Math.min(inP, 1 - outP), translate: `0px ${(1 - inP) * 50 - outP * 50}px`, filter: outP > 0 ? `blur(${outP * 8}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#061233" }}>
    <Background />
    {TL.scenes.map((s, i) => {
      const Comp = SCENES[s.id as SceneId];
      const last = i === TL.scenes.length - 1;
      return (
        <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.duration + (last ? 0 : OVERLAP)} layout="none">
          <SceneWrap last={last} first={i === 0}>
            <Comp />
          </SceneWrap>
        </Sequence>
      );
    })}
    <Navigator />
    <Subtitles />
    <ProgressBar />
    <Watermark />
    <Audio src={staticFile(`articles/${SLUG}/master.wav`)} />
  </AbsoluteFill>
);
