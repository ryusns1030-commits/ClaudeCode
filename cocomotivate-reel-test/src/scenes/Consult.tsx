import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, pop } from "../anim";
import { Card, SceneTag } from "../components/common";
import { IconChart, IconSpark, IconStory, IconTarget } from "../components/icons";
import { C, FONT, L, ROUND } from "../theme";
import { evIn } from "../timeline";

const Chip: React.FC<{ show: number; icon: React.ReactNode; title: string; detail?: string }> = ({ show, icon, title, detail }) => (
  <div style={{ maxHeight: Math.min(1, show * 1.4) * 130, overflow: "visible" }}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      background: C.white,
      borderRadius: 24,
      padding: "18px 24px",
      opacity: show,
      translate: `${(1 - show) * 80}px 0px`,
      scale: String(0.9 + 0.1 * show),
      transformOrigin: "right center",
    }}
  >
    <div style={{ width: 70, height: 70, borderRadius: 20, background: "#E8F0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
    <div>
      <div style={{ fontSize: 44, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>{title}</div>
      {detail && <div style={{ fontSize: 28, fontWeight: 700, color: C.sub }}>{detail}</div>}
    </div>
  </div>
  </div>
);

/** シーン3：ChatGPTへの相談（オリジナルのチャット風UI） */
export const Consult: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eOpen = evIn("consult", "chatOpen");
  const e1 = evIn("consult", "chip1");
  const e2 = evIn("consult", "chip2");
  const e3 = evIn("consult", "chip3");

  const date = pop(frame, fps, 8, 14);
  const win = pop(frame, fps, 16, 15);
  const bubble = pop(frame, fps, eOpen + 4, 14);
  const title = "運用状況を整理して相談";
  const typed = Math.floor(interpolate(frame, [eOpen + 8, eOpen + 30], [0, title.length], clamp));
  const typing = pop(frame, fps, e3 + 26, 14);

  return (
    <AbsoluteFill>
      <SceneTag no="03" label="ChatGPTに相談" />
      <div style={{ position: "absolute", right: L.side, top: 232, opacity: date, scale: String(0.6 + 0.4 * date) }}>
        <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 36, color: C.white, border: `3px solid ${C.glow}`, borderRadius: 18, padding: "2px 18px" }}>2026.11.05</div>
      </div>

      <Card style={{ position: "absolute", left: L.side, right: L.side, top: 330, height: 790, padding: 0, overflow: "hidden", opacity: win, translate: `0px ${(1 - win) * 100}px`, background: C.paper }}>
        {/* ヘッダー */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "24px 34px", background: C.white, borderBottom: `2px solid ${C.line}` }}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconSpark size={36} color={C.glow} />
          </div>
          <div style={{ fontSize: 38, fontWeight: 900 }}>AIチャット</div>
          <div style={{ marginLeft: "auto", fontSize: 24, fontWeight: 700, color: C.sub }}>※相談のイメージ</div>
        </div>
        {/* ユーザーの相談 */}
        <div style={{ padding: "28px 34px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${C.blue}, #1F4FD1)`,
              borderRadius: "34px 34px 8px 34px",
              padding: "22px 26px",
              width: 700,
              opacity: bubble,
              scale: String(0.85 + 0.15 * bubble),
              transformOrigin: "right top",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ fontSize: 38, fontWeight: 900, color: C.white, minHeight: 50 }}>
              {title.slice(0, typed)}
              <span style={{ opacity: typed < title.length && frame % 16 < 8 ? 1 : 0 }}>｜</span>
            </div>
            <Chip show={pop(frame, fps, e1, 13)} icon={<IconChart size={44} />} title="数字" detail="フォロワー数・閲覧数" />
            <Chip show={pop(frame, fps, e2, 13)} icon={<IconStory size={44} />} title="投稿状況" detail="投稿枚数・投稿時間" />
            <Chip show={pop(frame, fps, e3, 13)} icon={<IconTarget size={44} />} title="運用目的" />
          </div>
        </div>
        {/* AIが考え中 */}
        <div style={{ position: "absolute", left: 34, bottom: 28, display: "flex", alignItems: "center", gap: 14, opacity: typing, translate: `${(1 - typing) * -40}px 0px` }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconSpark size={30} color={C.glow} />
          </div>
          <div style={{ background: C.white, borderRadius: "30px 30px 30px 8px", padding: "18px 26px", display: "flex", gap: 10, border: `2px solid ${C.line}` }}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ width: 18, height: 18, borderRadius: "50%", background: C.blue, translate: `0px ${-Math.max(0, Math.sin((frame - k * 5) * 0.35)) * 10}px` }} />
            ))}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.sub }}>改善策を検討中…</div>
        </div>
      </Card>
    </AbsoluteFill>
  );
};
