import React from "react";
import { AbsoluteFill } from "remotion";
import { CharacterSVG } from "./character/CharacterSVG";
import { Background, Card } from "./components/common";
import { IconEye, IconUsers } from "./components/icons";
import { C, FONT, L, ROUND } from "./theme";

/** カバー画像（thumbnail.png） */
export const Cover: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <div style={{ position: "absolute", top: 250, left: L.side, right: L.side, fontFamily: FONT, color: C.white }}>
      <div style={{ display: "inline-block", fontFamily: ROUND, fontWeight: 900, fontSize: 40, color: C.navy, background: C.glow, borderRadius: 999, padding: "6px 26px" }}>
        ChatGPTでストーリーズを見直した話
      </div>
    </div>
    <Card style={{ position: "absolute", left: L.side, right: L.side, top: 370, padding: "36px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <IconUsers size={56} />
        <div style={{ fontSize: 44, fontWeight: 900 }}>フォロワー</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontSize: 56, fontWeight: 900, color: C.sub }}>約</span>
        <span style={{ fontFamily: ROUND, fontSize: 180, fontWeight: 900, color: C.blue, lineHeight: 1.05 }}>3,433</span>
        <span style={{ fontSize: 60, fontWeight: 900 }}>人</span>
      </div>
    </Card>
    <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.white }}>でも…</div>
    <Card style={{ position: "absolute", left: L.side, right: L.side, top: 800, padding: "36px 48px", border: `6px solid ${C.coral}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <IconEye size={56} />
        <div style={{ fontSize: 44, fontWeight: 900 }}>ストーリーズ閲覧数</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: ROUND, fontSize: 190, fontWeight: 900, color: C.coral, lineHeight: 1.05 }}>20</span>
        <span style={{ fontSize: 86, fontWeight: 900, color: C.coral }}>台</span>
        <span style={{ fontSize: 32, fontWeight: 700, color: C.sub, marginLeft: 20 }}>投稿から約20時間後</span>
      </div>
    </Card>
    <div style={{ position: "absolute", left: 540 - 190, top: 1150 }}>
      <CharacterSVG width={380} height={456} expression="surprised" mouth="o" antenna={1}
        leftHand={{ x: 84, y: 214, rot: -30 }} rightHand={{ x: 316, y: 214, rot: 30 }} idPrefix="cover" />
    </div>
    <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, textAlign: "center", fontFamily: ROUND, fontWeight: 900, fontSize: 44, color: C.white }}>
      Co.Co.Motivate
    </div>
  </AbsoluteFill>
);
