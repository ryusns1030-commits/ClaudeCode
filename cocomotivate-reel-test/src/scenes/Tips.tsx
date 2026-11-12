import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeInOut, pop, prog } from "../anim";
import { Card, SceneTag } from "../components/common";
import { IconChart, IconSpark, IconTarget } from "../components/icons";
import { C, FONT, L, ROUND } from "../theme";
import { evIn } from "../timeline";

/** ① 3つの要素がひとまとまりになる */
const SetIllust: React.FC<{ p: number }> = ({ p }) => {
  const items = [
    { t: "数字", c: C.blue },
    { t: "現状", c: C.sky },
    { t: "目的", c: C.coral },
  ];
  const merge = interpolate(p, [0.45, 1], [0, 1], { ...clamp, easing: easeInOut });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 - merge * 14, padding: 6, borderRadius: 999, border: `4px solid rgba(47,107,255,${merge})` }}>
      {items.map((x, i) => {
        const s = interpolate(p, [i * 0.12, i * 0.12 + 0.3], [0, 1], clamp);
        return (
          <div key={x.t} style={{ fontSize: 30, fontWeight: 900, color: C.white, background: x.c, padding: "6px 20px", borderRadius: 999, scale: String(s), marginLeft: i ? -merge * 6 : 0 }}>
            {x.t}
          </div>
        );
      })}
      <div style={{ fontSize: 28, fontWeight: 900, color: C.blue, opacity: merge, paddingRight: 12 }}>セット</div>
    </div>
  );
};

/** ② 小さな一歩から試す */
const StepIllust: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 76 }}>
    {[0, 1, 2, 3].map((i) => {
      const s = interpolate(p, [i * 0.15, i * 0.15 + 0.3], [0, 1], clamp);
      return (
        <div key={i} style={{ width: 64, height: 18 + i * 18, borderRadius: 10, background: i === 0 ? C.blue : C.line, scale: `1 ${s}`, transformOrigin: "bottom" }} />
      );
    })}
    <div style={{ fontSize: 26, fontWeight: 900, color: C.blue, marginLeft: 8, opacity: interpolate(p, [0.5, 0.8], [0, 1], clamp) }}>まず1つ</div>
  </div>
);

/** ③ 前と後を同じ物差しで比べる（数値は入れない概念図） */
const CompareIllust: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 90 }}>
    {[
      { t: "前", c: C.sub },
      { t: "後", c: C.blue },
    ].map((x, i) => (
      <div key={x.t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ width: 64, height: 56 * interpolate(p, [i * 0.25, i * 0.25 + 0.4], [0, 1], clamp), borderRadius: "10px 10px 0 0", background: x.c, opacity: i ? 1 : 0.5 }} />
        <div style={{ fontSize: 24, fontWeight: 900, color: C.sub }}>{x.t}</div>
      </div>
    ))}
    <div style={{ fontSize: 26, fontWeight: 900, color: C.blue, marginBottom: 34, opacity: interpolate(p, [0.6, 0.9], [0, 1], clamp) }}>同じ条件で比べる</div>
  </div>
);

const TipCard: React.FC<{ n: number; show: number; active: number; title: React.ReactNode; icon: React.ReactNode; illust: React.ReactNode; top: number }> = ({ n, show, active, title, icon, illust, top }) => (
  <Card
    style={{
      position: "absolute",
      left: L.side,
      right: L.side,
      top,
      height: 236,
      padding: "24px 30px",
      display: "flex",
      gap: 24,
      opacity: show,
      translate: `${(1 - show) * 140}px 0px`,
      scale: String(0.94 + 0.06 * show + 0.02 * active),
      border: `5px solid ${active > 0.5 ? C.glow : "transparent"}`,
      boxShadow: active > 0.5 ? "0 0 0 6px rgba(111,227,255,0.25), 0 24px 60px rgba(0,6,30,0.45)" : undefined,
    }}
  >
    <div style={{ width: 92, height: 92, flex: "none", borderRadius: 28, background: C.navy, color: C.glow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ROUND, fontWeight: 900, fontSize: 60 }}>
      {n}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.25, whiteSpace: "nowrap" }}>{title}</div>
      {illust}
    </div>
  </Card>
);

/** シーン6：視聴者が持ち帰れる「AI活用のコツ3つ」 */
export const Tips: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eTool = evIn("tips", "tool");
  const eTitle = evIn("tips", "tipsTitle");
  const t = [evIn("tips", "tip1"), evIn("tips", "tip2"), evIn("tips", "tip3")];

  const intro = pop(frame, fps, Math.min(eTool - 30, 4), 14);
  const title = pop(frame, fps, eTitle - 4, 14);
  // コツ①が始まったら導入カードを上部の帯へ縮める
  const shrink = prog(frame, t[0] - 18, 16, easeInOut);
  const active = (i: number) => (frame >= t[i] && (i === 2 || frame < t[i + 1]) ? 1 : 0);

  return (
    <AbsoluteFill>
      <SceneTag no="06" label="AI活用のコツ" />

      {/* 導入：AIは改善策を考える道具 */}
      <Card
        style={{
          position: "absolute",
          left: L.side,
          right: L.side,
          top: interpolate(shrink, [0, 1], [430, 310]),
          height: interpolate(shrink, [0, 1], [300, 120]),
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          opacity: intro,
          scale: String(0.9 + 0.1 * intro),
          overflow: "hidden",
        }}
      >
        <div style={{ width: interpolate(shrink, [0, 1], [130, 76]), height: interpolate(shrink, [0, 1], [130, 76]), flex: "none", borderRadius: 32, background: "#E8F0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconSpark size={interpolate(shrink, [0, 1], [80, 46])} />
        </div>
        <div>
          <div style={{ fontSize: interpolate(shrink, [0, 1], [40, 28]), fontWeight: 700, color: C.sub }}>AIは</div>
          <div style={{ fontSize: interpolate(shrink, [0, 1], [66, 46]), fontWeight: 900, color: C.blue, lineHeight: 1.2 }}>改善策を考える道具</div>
        </div>
      </Card>

      {/* 見出し */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: interpolate(shrink, [0, 1], [780, 455]),
          textAlign: "center",
          fontFamily: ROUND,
          fontWeight: 900,
          fontSize: interpolate(shrink, [0, 1], [96, 60]),
          color: C.white,
          opacity: title,
          scale: String(0.7 + 0.3 * title),
        }}
      >
        使うコツは<span style={{ color: C.glow }}>3つ</span>
      </div>

      <TipCard n={1} top={560} show={pop(frame, fps, t[0] - 4, 14)} active={active(0)} icon={<IconTarget size={50} />} title={<>数字・現状・目的を<span style={{ color: C.blue }}>セット</span>で伝える</>} illust={<SetIllust p={prog(frame, t[0] + 6, 40)} />} />
      <TipCard n={2} top={816} show={pop(frame, fps, t[1] - 4, 14)} active={active(1)} icon={<IconSpark size={50} color={C.amber} />} title={<>出てきた案は<span style={{ color: C.blue }}>小さく試す</span></>} illust={<StepIllust p={prog(frame, t[1] + 6, 36)} />} />
      <TipCard n={3} top={1072} show={pop(frame, fps, t[2] - 4, 14)} active={active(2)} icon={<IconChart size={50} />} title={<>前と後の<span style={{ color: C.blue }}>数字</span>で確かめる</>} illust={<CompareIllust p={prog(frame, t[2] + 6, 40)} />} />

      <div style={{ position: "absolute", right: L.side, top: 1318, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.7)", opacity: interpolate(frame, [t[0], t[0] + 12], [0, 1], clamp) }}>
        ※今回の経験から整理した考え方です
      </div>
    </AbsoluteFill>
  );
};
