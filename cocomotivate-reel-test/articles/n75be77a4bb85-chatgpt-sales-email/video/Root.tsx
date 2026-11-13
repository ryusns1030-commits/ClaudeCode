import React from "react";
import { AbsoluteFill, Composition, Still, continueRender, delayRender } from "remotion";
import { CharacterSVG } from "../../../src/character/CharacterSVG";
import { C, FONT, fontsReady, ROUND } from "../../../src/theme";
import { Background, CONTENT_W, SAFE } from "./layout";
import { Reel } from "./Reel";
import { TL } from "./tl";

const handle = delayRender("fonts");
fontsReady.then(() => continueRender(handle));

/** サムネイル（3媒体共通のセーフエリア内に主要情報を置く） */
const Cover: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <div style={{ position: "absolute", left: SAFE.left, top: 300, width: CONTENT_W }}>
      <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.navy, background: C.glow, borderRadius: 999, padding: "8px 26px" }}>
        ChatGPT × 英語の営業メール
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1.25, color: C.white, marginTop: 40 }}>
        英訳した
        <br />
        営業メール、
        <br />
        <span style={{ color: C.coral }}>そのまま</span>
        <br />
        送ってない？
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 50 }}>
        {[
          ["頼み方", "3つ"],
          ["送る前のチェック", "5つ"],
        ].map(([a, b]) => (
          <div key={a} style={{ background: C.white, borderRadius: 28, padding: "18px 28px", fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.ink }}>
            {a} <span style={{ fontFamily: ROUND, fontSize: 56, color: C.blue }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: "absolute", left: 600, top: 1060, width: 340, height: 408 }}>
      <CharacterSVG idPrefix="cv" width={340} height={408} expression="surprised" mouth="o" antenna={1} leftHand={{ x: 40, y: 220, rot: -88 }} />
    </div>
    <div style={{ position: "absolute", left: SAFE.left, top: 1500, fontFamily: ROUND, fontWeight: 900, fontSize: 44, color: C.white }}>Co.Co.Motivate</div>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);
