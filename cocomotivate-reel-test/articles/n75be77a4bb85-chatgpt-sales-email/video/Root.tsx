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

/**
 * 3媒体共通サムネイル（1080×1920）。主要情報をすべて中央の正方形（y=420〜1500）に収め、
 * Instagramのプロフィールグリッド（中央3:4）、正方形表示、TikTok/YouTubeの右側UIに切られないようにする。
 */
const CoverCommon: React.FC = () => (
  <AbsoluteFill>
    <Background />
    {/* 中央正方形の外側は装飾だけ */}
    <div style={{ position: "absolute", left: 72, top: 450, fontFamily: FONT, fontWeight: 900, fontSize: 38, color: C.navy, background: C.glow, borderRadius: 999, padding: "8px 28px" }}>
      ChatGPT × 英語の営業メール
    </div>
    <div style={{ position: "absolute", left: 72, top: 540, fontFamily: FONT, fontWeight: 900, fontSize: 112, lineHeight: 1.16, color: C.white, letterSpacing: -1 }}>
      英訳メール、
      <br />
      <span style={{ color: C.coral }}>そのまま</span>
      <br />
      送ってない？
    </div>
    <div style={{ position: "absolute", left: 740, top: 560, width: 250, height: 300 }}>
      <CharacterSVG idPrefix="cc" width={250} height={300} expression="surprised" mouth="o" antenna={1} leftHand={{ x: 40, y: 220, rot: -88 }} />
    </div>
    <div style={{ position: "absolute", left: 72, top: 975, display: "flex", gap: 18 }}>
      {[
        ["頼み方", "3つ"],
        ["送る前のチェック", "5つ"],
      ].map(([a, b]) => (
        <div key={a} style={{ background: C.white, borderRadius: 28, padding: "16px 28px", fontFamily: FONT, fontWeight: 900, fontSize: 42, color: C.ink, display: "flex", alignItems: "baseline", gap: 10 }}>
          {a}
          <span style={{ fontFamily: ROUND, fontSize: 64, color: C.blue }}>{b}</span>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 72, top: 1150, width: 860, fontFamily: FONT, fontWeight: 700, fontSize: 36, lineHeight: 1.5, color: "rgba(255,255,255,0.9)" }}>
      AIの英文は“下書き”。
      <br />
      送る前に、人が確かめるコツ。
    </div>
    <div style={{ position: "absolute", left: 72, top: 1380, fontFamily: ROUND, fontWeight: 900, fontSize: 48, color: C.white, letterSpacing: 1 }}>Co.Co.Motivate</div>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
    <Still id="CoverCommon" component={CoverCommon} width={1080} height={1920} />
  </>
);
