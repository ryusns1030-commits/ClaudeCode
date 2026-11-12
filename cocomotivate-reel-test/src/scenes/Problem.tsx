import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeInOut, pop, prog } from "../anim";
import { Card, SceneTag } from "../components/common";
import { IconCalendar, IconClock, IconStory } from "../components/icons";
import { C, FONT, L, ROUND } from "../theme";
import { evIn } from "../timeline";

const SHEETS = [1, 4, 2, 5, 3, 1, 5]; // 1〜5枚で変動することを示すイメージ
const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const POSTED = [true, false, true, true, false, true, false]; // 投稿しない日があることのイメージ

/** Instagramストーリーズ風のオリジナルUI（実在UIの複製ではないイメージ図） */
const Phone: React.FC<{ n: number; frame: number }> = ({ n, frame }) => {
  const segP = (frame % 24) / 24;
  return (
    <div style={{ width: 380, height: 700, borderRadius: 58, background: "#050B1E", padding: 14, boxShadow: "0 30px 70px rgba(0,0,0,0.5)", border: "3px solid rgba(255,255,255,0.15)" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 46, overflow: "hidden", position: "relative", background: `linear-gradient(160deg, ${C.sky}, ${C.blue} 55%, ${C.navy})` }}>
        <div style={{ position: "absolute", top: 26, left: 22, right: 22, display: "flex", gap: 6 }}>
          {new Array(n).fill(0).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.4)", overflow: "hidden" }}>
              <div style={{ width: `${i === 0 ? segP * 100 : 0}%`, height: "100%", background: "#fff" }} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: 50, left: 22, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff", border: `4px solid ${C.glow}` }} />
          <div style={{ width: 130, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.8)" }} />
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 230, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.85)", width: "80%" }} />
          <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.6)", width: "95%" }} />
          <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.6)", width: "60%" }} />
        </div>
        <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", fontFamily: ROUND, fontWeight: 900, fontSize: 64, color: "#fff" }}>
          {n}<span style={{ fontSize: 36 }}>枚</span>
        </div>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ show: number; icon: React.ReactNode; title: string; value: string; children?: React.ReactNode; top: number }> = ({ show, icon, title, value, children, top }) => (
  <Card style={{ position: "absolute", left: 490, right: L.side, top, padding: "22px 30px", opacity: show, translate: `${(1 - show) * 160}px 0px` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {icon}
      <div style={{ fontSize: 32, fontWeight: 700, color: C.sub }}>{title}</div>
    </div>
    <div style={{ fontSize: 50, fontWeight: 900, marginTop: 4, lineHeight: 1.25 }}>{value}</div>
    {children}
  </Card>
);

/** シーン2：問題の整理 */
export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eSheets = evIn("problem", "sheets");
  const eTime = evIn("problem", "timeRandom");
  const eSkip = evIn("problem", "skipDays");

  const phone = pop(frame, fps, 4, 15);
  const idx = Math.max(0, Math.floor((frame - eSheets) / 12));
  const n = frame < eSheets ? 3 : SHEETS[idx % SHEETS.length];
  const c1 = pop(frame, fps, eSheets - 4, 14);
  const c2 = pop(frame, fps, eTime - 4, 14);
  const c3 = pop(frame, fps, eSkip - 4, 14);
  // 時計の針がランダムな時刻へ跳ぶ
  const jump = Math.floor(Math.max(0, frame - eTime) / 14);
  const target = [40, 200, 95, 310, 150, 260][jump % 6];
  const ang = interpolate((frame - eTime) % 14, [0, 8], [target - 90, target], { ...clamp, easing: easeInOut });


  return (
    <AbsoluteFill>
      <SceneTag no="02" label="当時の運用状況" />
      <div>
        <div style={{ position: "absolute", left: L.side - 10, top: 330, scale: String(0.8 + 0.2 * phone), opacity: phone, rotate: `${(1 - phone) * -8}deg` }}>
          <Phone n={n} frame={frame} />
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: 12, textAlign: "center" }}>※画面はイメージです</div>
        </div>
        <InfoCard show={c1} top={340} icon={<IconStory size={50} />} title="投稿枚数" value="1〜5枚">
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {[1, 2, 3, 4, 5].map((k) => (
              <div key={k} style={{ flex: 1, height: 16, borderRadius: 8, background: k <= n ? C.blue : C.line }} />
            ))}
          </div>
        </InfoCard>
        <InfoCard show={c2} top={580} icon={<IconClock size={50} angle={ang} angle2={ang * 12} />} title="投稿時間" value="決まっていない" />
        <InfoCard show={c3} top={770} icon={<IconCalendar size={50} />} title="投稿頻度" value="投稿しない日も">
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {DAYS.map((d, i) => {
              const on = prog(frame, eSkip + i * 3, 8);
              return (
                <div key={d} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.sub }}>{d}</div>
                  <div
                    style={{
                      margin: "4px auto 0",
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: POSTED[i] ? C.blue : "transparent",
                      border: POSTED[i] ? "none" : `4px dashed ${C.coral}`,
                      scale: String(on),
                    }}
                  />
                </div>
              );
            })}
          </div>
        </InfoCard>
      </div>

    </AbsoluteFill>
  );
};
