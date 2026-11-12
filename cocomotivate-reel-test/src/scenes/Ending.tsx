import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeInOut, pop, prog } from "../anim";
import { Card } from "../components/common";
import { IconChart, IconSpark } from "../components/icons";
import { C, FONT, L, ROUND } from "../theme";
import { evIn, TL } from "../timeline";

const Row: React.FC<{ show: number; icon: React.ReactNode; left: string; right: string; color: string }> = ({ show, icon, left, right, color }) => (
  <Card style={{ display: "flex", alignItems: "center", gap: 24, padding: "30px 40px", opacity: show, translate: `0px ${(1 - show) * 60}px`, scale: String(0.9 + 0.1 * show) }}>
    <div style={{ width: 100, height: 100, borderRadius: 28, background: "#E8F0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
    <div>
      <div style={{ fontSize: 34, fontWeight: 700, color: C.sub }}>{left}</div>
      <div style={{ fontSize: 58, fontWeight: 900, color }}>{right}</div>
    </div>
  </Card>
);

/** シーン6：エンディング */
export const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eTool = evIn("ending", "tool");
  const eVerify = evIn("ending", "verify");
  const e1 = evIn("ending", "final1");
  const e2 = evIn("ending", "final2");
  const lastSub = TL.subtitles[TL.subtitles.length - 1];
  const endingFrom = TL.scenes.find((s) => s.id === "ending")!.from;
  const t1from = lastSub.from - endingFrom;

  const r1 = pop(frame, fps, eTool - 40, 14);
  const r2 = pop(frame, fps, eVerify - 24, 14);
  const outA = prog(frame, Math.min(e1, t1from) - 16, 12, easeInOut);
  const w1 = pop(frame, fps, Math.min(e1, t1from) - 2, 12, 180);
  const w2 = pop(frame, fps, e2 - 2, 12, 180);
  const underline = prog(frame, e2 + 8, 16);
  const logo = pop(frame, fps, e2 + 30, 15);
  const credit = interpolate(frame, [e2 + 40, e2 + 52], [0, 1], clamp);

  return (
    <AbsoluteFill>
      {/* 前半：ポイントの整理 */}
      <div style={{ position: "absolute", left: L.side, right: L.side, top: 340, display: "flex", flexDirection: "column", gap: 28, opacity: 1 - outA, translate: `0px ${-outA * 80}px` }}>
        <Row show={r1} icon={<IconSpark size={64} />} left="AIは" right="改善策を考える道具" color={C.blue} />
        <Row show={r2} icon={<IconChart size={64} />} left="実際の効果は" right="数字で検証する" color={C.coral} />
      </div>

      {/* 後半：決め台詞（ナレーション同期） */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: ROUND, fontWeight: 900, color: C.white, lineHeight: 1.25 }}>
        <div style={{ fontSize: 118, opacity: w1, scale: String(0.7 + 0.3 * w1), translate: `0px ${(1 - w1) * 40}px` }}>AIで考え、</div>
        <div style={{ fontSize: 118, opacity: w2, scale: String(0.7 + 0.3 * w2), translate: `0px ${(1 - w2) * 40}px`, position: "relative", display: "inline-block" }}>
          <span style={{ color: C.glow }}>数字</span>で確かめる。
          <div style={{ position: "absolute", left: 0, bottom: -6, height: 14, borderRadius: 7, width: `${underline * 100}%`, background: `linear-gradient(90deg, ${C.glow}, ${C.blue})` }} />
        </div>
      </div>

      {/* ロゴ */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", flexDirection: "column", alignItems: "center", opacity: logo, scale: String(0.8 + 0.2 * logo) }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.85)", letterSpacing: 6 }}>株式会社</div>
        <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 84, color: C.white, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>
          Co.Co.Motivate
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.glow, display: "inline-block", marginLeft: 6, boxShadow: `0 0 24px ${C.glow}` }} />
        </div>
      </div>

      {/* クレジット */}
      <div style={{ position: "absolute", left: 0, right: 0, top: L.subTop + 70, textAlign: "center", fontFamily: FONT, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.75)", opacity: credit, lineHeight: 1.6 }}>
        ナレーション　VOICEVOX:春日部つむぎ
        <br />
        原作：note記事「ChatGPTでInstagramストーリーズを見直した。」
      </div>
    </AbsoluteFill>
  );
};
