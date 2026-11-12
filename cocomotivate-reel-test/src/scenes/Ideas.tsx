import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeInOut, pop, prog } from "../anim";
import { Card, SceneTag } from "../components/common";
import { IconBulb, IconPoll, IconQuestion } from "../components/icons";
import { C, FONT, L } from "../theme";
import { evIn } from "../timeline";

const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const DAY_COLORS = [C.blue, C.sky, C.coral, C.amber, "#7C6CFF", C.blue, C.sky];

const MiniPoll: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
    {["A", "B"].map((x, i) => (
      <div key={x} style={{ height: 44, borderRadius: 14, background: C.line, overflow: "hidden", position: "relative" }}>
        <div style={{ width: `${(i === 0 ? 62 : 38) * p}%`, height: "100%", background: i === 0 ? C.blue : C.sky }} />
        <div style={{ position: "absolute", left: 14, top: 2, fontSize: 28, fontWeight: 900, color: C.navy }}>{x}</div>
      </div>
    ))}
  </div>
);

const MiniTip: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
    {[90, 70, 80].map((w, i) => (
      <div key={i} style={{ height: 14, borderRadius: 7, background: i === 0 ? C.amber : C.line, width: `${w * prog(p * 30, i * 6, 12)}%` }} />
    ))}
  </div>
);

const MiniAsk: React.FC<{ p: number; frame: number }> = ({ p, frame }) => (
  <div style={{ width: "100%", background: "#F0F5FF", borderRadius: 14, padding: "10px 14px", border: `2px solid ${C.line}` }}>
    <div style={{ fontSize: 24, fontWeight: 700, color: C.sub }}>質問をどうぞ</div>
    <div style={{ height: 30, borderRadius: 8, background: C.white, marginTop: 6, display: "flex", alignItems: "center", paddingLeft: 8 }}>
      <div style={{ width: 3, height: 20, background: C.blue, opacity: p > 0.5 && frame % 20 < 10 ? 1 : 0 }} />
    </div>
  </div>
);

/** シーン4：検討した改善案（カード型UI） */
export const Ideas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eWeek = evIn("ideas", "ideaWeek");
  const ev = [evIn("ideas", "idea1"), evIn("ideas", "idea2"), evIn("ideas", "idea3")];

  const week = pop(frame, fps, eWeek - 6, 14);
  // 最初の案は大きく中央 → 3枚が並ぶと上部へ縮小移動
  const settle = prog(frame, ev[0] - 10, 20, easeInOut);
  const weekTop = interpolate(settle, [0, 1], [480, 330]);
  const weekScale = interpolate(settle, [0, 1], [1.08, 0.94]);

  const cards = [
    { title: "2択アンケート", icon: <IconPoll size={60} />, body: (p: number) => <MiniPoll p={p} /> },
    { title: "役立つ情報", icon: <IconBulb size={60} color={C.amber} />, body: (p: number) => <MiniTip p={p} /> },
    { title: "質問募集", icon: <IconQuestion size={60} />, body: (p: number) => <MiniAsk p={p} frame={frame} /> },
  ];
  const cardW = 300;
  const gap = 18;
  const rowLeft = (1080 - (cardW * 3 + gap * 2)) / 2;

  return (
    <AbsoluteFill>
      <SceneTag no="04" label="検討した改善案" />

      <Card style={{ position: "absolute", left: L.side, right: L.side, top: weekTop, padding: "34px 40px", opacity: week, scale: String(weekScale * (0.85 + 0.15 * week)), transformOrigin: "center top" }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.sub }}>案1</div>
        <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.25 }}>曜日ごとに種類を変える</div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          {DAYS.map((d, i) => {
            const s = pop(frame, fps, eWeek + i * 3, 12);
            return (
              <div key={d} style={{ flex: 1, height: 100, borderRadius: 20, background: DAY_COLORS[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900, color: C.white, scale: String(s), translate: `0px ${(1 - s) * 30}px` }}>
                {d}
              </div>
            );
          })}
        </div>
      </Card>

      {cards.map((c, i) => {
        const s = pop(frame, fps, ev[i] - 4, 13, 150);
        // 登場時は大きく中央寄り → 並びの位置へ移動
        const move = prog(frame, ev[i] + 4, 16, easeInOut);
        const finalLeft = rowLeft + i * (cardW + gap);
        const left = interpolate(move, [0, 1], [(1080 - cardW) / 2, finalLeft]);
        const scale = interpolate(move, [0, 1], [1.25, 1]) * (0.6 + 0.4 * s);
        const top = interpolate(move, [0, 1], [760, 730]);
        return (
          <Card key={c.title} style={{ position: "absolute", left, top, width: cardW, height: 330, padding: "26px 22px", opacity: Math.min(1, s * 1.5), scale: String(scale), zIndex: 10 + i, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.sub }}>案{i + 2}</div>
            {c.icon}
            <div style={{ fontSize: 38, fontWeight: 900, whiteSpace: "nowrap" }}>{c.title}</div>
            {c.body(prog(frame, ev[i] + 6, 20))}
          </Card>
        );
      })}

      <div style={{ position: "absolute", left: L.side, top: 1090, fontFamily: FONT, fontWeight: 700, fontSize: 28, color: "rgba(255,255,255,0.75)", opacity: interpolate(frame, [ev[2] + 10, ev[2] + 24], [0, 1], clamp) }}>
        ※検討した案です（実施結果ではありません）
      </div>
    </AbsoluteFill>
  );
};
