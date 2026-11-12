import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, pop, prog } from "../anim";
import { Card, SceneTag } from "../components/common";
import { IconCheck } from "../components/icons";
import { C, FONT, L, ROUND } from "../theme";
import { evIn } from "../timeline";

/** シーン5：重要な結論「改善策を考えた ≠ 効果が出た」 */
export const Truth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eThought = evIn("truth", "thought");
  const eNot = evIn("truth", "notConfirmed");

  const a = pop(frame, fps, Math.min(eThought - 4, 4), 13);
  const check = pop(frame, fps, eThought + 14, 10, 220);
  const neq = pop(frame, fps, eThought + 34, 9, 200);
  const b = pop(frame, fps, eThought + 46, 13);
  const before = prog(frame, eThought + 60, 18);
  const q = 1 + Math.sin(frame * 0.3) * 0.08;
  const stamp = pop(frame, fps, eNot, 8, 300);
  const stampScale = interpolate(stamp, [0, 1], [2.6, 1]);

  return (
    <AbsoluteFill>
      <SceneTag no="05" label="大事なポイント" />

      <Card style={{ position: "absolute", left: L.side, right: L.side, top: 330, height: 200, padding: "0 44px", display: "flex", alignItems: "center", gap: 26, opacity: a, translate: `${(1 - a) * -120}px 0px` }}>
        <div style={{ scale: String(check) }}>
          <IconCheck size={96} />
        </div>
        <div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.sub }}>確認できたこと</div>
          <div style={{ fontSize: 64, fontWeight: 900 }}>改善策を考えた</div>
        </div>
      </Card>

      <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: ROUND, fontWeight: 900, fontSize: 150, color: C.coral, lineHeight: 1, scale: String(neq), rotate: `${(1 - neq) * 90}deg` }}>
        ≠
      </div>

      <Card style={{ position: "absolute", left: L.side, right: L.side, top: 710, height: 340, padding: "28px 44px", border: `5px dashed ${C.coral}`, background: "#FFF7F7", opacity: b, translate: `${(1 - b) * 120}px 0px` }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.sub }}>確認できていないこと</div>
        <div style={{ fontSize: 60, fontWeight: 900 }}>効果が出た</div>
        {/* 実施前後の閲覧数グラフ（実施後はデータなし） */}
        <div style={{ position: "absolute", left: 44, bottom: 28, display: "flex", alignItems: "flex-end", gap: 34, height: 150 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.coral }}>20台</div>
            <div style={{ width: 110, height: 40 * before, background: C.coral, borderRadius: "10px 10px 0 0" }} />
            <div style={{ fontSize: 24, fontWeight: 700, color: C.sub, marginTop: 6 }}>相談時点</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 110, height: 100, border: `4px dashed ${C.sub}`, borderBottom: "none", borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ROUND, fontWeight: 900, fontSize: 56, color: C.sub, scale: String(q), opacity: before }}>
              ?
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.sub, marginTop: 6 }}>実施後</div>
          </div>
        </div>
        {/* 未確認スタンプ */}
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 110,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 64,
            color: C.coral,
            border: `8px solid ${C.coral}`,
            borderRadius: 20,
            padding: "4px 24px",
            rotate: "-12deg",
            scale: String(stampScale),
            opacity: stamp,
            background: "rgba(255,255,255,0.85)",
          }}
        >
          未確認
        </div>
      </Card>
    </AbsoluteFill>
  );
};
