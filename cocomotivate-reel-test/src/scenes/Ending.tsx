import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, pop, prog } from "../anim";
import { C, FONT, L, ROUND } from "../theme";
import { evIn, TL } from "../timeline";

const Bookmark: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M16 6h32a4 4 0 0 1 4 4v48L32 44 12 58V10a4 4 0 0 1 4-4z" fill={C.navy} />
  </svg>
);

/** シーン7：オチ（私たちもこの運用を実践していく）＋保存の呼びかけ */
export const Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e1 = evIn("ending", "final1");
  const e2 = evIn("ending", "final2");
  const ePr = evIn("ending", "practice");
  const endingFrom = TL.scenes.find((s) => s.id === "ending")!.from;
  const lastSub = TL.subtitles[TL.subtitles.length - 1];
  const subEnd = lastSub.to - endingFrom;

  const w1 = pop(frame, fps, e1 - 4, 12, 180);
  const w2 = pop(frame, fps, e2 - 4, 12, 180);
  const underline = prog(frame, e2 + 6, 14);
  // 「私たちも」の発話に合わせて社名から入る
  const logo = pop(frame, fps, 4, 15);
  const pr = pop(frame, fps, ePr - 2, 12, 200);
  const cta = pop(frame, fps, subEnd + 2, 14);
  const credit = interpolate(frame, [subEnd + 10, subEnd + 22], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: ROUND, fontWeight: 900, color: C.white, lineHeight: 1.25 }}>
        <div style={{ fontSize: 112, opacity: w1, scale: String(0.7 + 0.3 * w1), translate: `0px ${(1 - w1) * 40}px` }}>AIで考え、</div>
        <div style={{ fontSize: 112, opacity: w2, scale: String(0.7 + 0.3 * w2), translate: `0px ${(1 - w2) * 40}px`, position: "relative", display: "inline-block" }}>
          <span style={{ color: C.glow }}>数字</span>で確かめる。
          <div style={{ position: "absolute", left: 0, bottom: -6, height: 14, borderRadius: 7, width: `${underline * 100}%`, background: `linear-gradient(90deg, ${C.glow}, ${C.blue})` }} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: logo, scale: String(0.85 + 0.15 * logo) }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.85)", letterSpacing: 6 }}>株式会社</div>
        <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 80, color: C.white, display: "flex", alignItems: "center", gap: 6 }}>
          Co.Co.Motivate
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: C.glow, display: "inline-block", marginLeft: 6, boxShadow: `0 0 24px ${C.glow}` }} />
        </div>
        <div style={{ marginTop: 14, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.navy, background: C.glow, borderRadius: 999, padding: "10px 36px", scale: String(pr), boxShadow: "0 10px 30px rgba(111,227,255,0.35)" }}>
          この運用を、実践していきます
        </div>
      </div>

      {/* 保存の呼びかけ（ナレーション終了後に字幕帯の位置へ） */}
      <div style={{ position: "absolute", left: 0, right: 0, top: L.subTop + 10, display: "flex", justifyContent: "center", opacity: cta, translate: `0px ${(1 - cta) * 30}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: C.white, borderRadius: 30, padding: "20px 36px", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
          <Bookmark size={56} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.ink, lineHeight: 1.3 }}>
            保存して、AIに相談するときの
            <br />
            チェックリストに
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", fontFamily: FONT, fontWeight: 500, fontSize: 24, color: "rgba(255,255,255,0.7)", opacity: credit, lineHeight: 1.5 }}>
        ナレーション　VOICEVOX:春日部つむぎ
        <br />
        原作：note記事「ChatGPTでInstagramストーリーズを見直した。」
      </div>
    </AbsoluteFill>
  );
};
