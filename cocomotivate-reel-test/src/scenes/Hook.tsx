import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, pop, prog } from "../anim";
import { Card, countText } from "../components/common";
import { IconEye, IconUsers } from "../components/icons";
import { C, FONT, L, ROUND } from "../theme";
import { evIn } from "../timeline";

/** シーン1：驚きの数字 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cStart = evIn("hook", "followersCount");
  const vLabel = evIn("hook", "viewsLabel");
  const vReveal = evIn("hook", "viewsReveal");

  const chip = pop(frame, fps, 0, 15);
  const card1 = pop(frame, fps, 6, 14);
  const count = prog(frame, cStart, 28);
  const card2 = pop(frame, fps, vLabel - 6, 14);
  const reveal = pop(frame, fps, vReveal, 9, 260);
  const shake = frame >= vReveal ? Math.sin((frame - vReveal) * 2.2) * 14 * Math.exp(-(frame - vReveal) / 6) : 0;
  const qPulse = 1 + Math.sin(frame * 0.35) * 0.06;
  // 閲覧数バー：フォロワー比のごく細いバー
  const tinyBar = prog(frame, vReveal + 4, 16);

  return (
    <AbsoluteFill>
      {/* 日付チップ */}
      <div style={{ position: "absolute", top: 236, left: L.side, opacity: chip, translate: `${(1 - chip) * -30}px 0px`, display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 30, color: C.navy, background: C.glow, borderRadius: 999, padding: "4px 18px" }}>2026年11月</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.9)" }}>ある Instagram アカウントの話</div>
      </div>

      {/* フォロワー */}
      <Card style={{ position: "absolute", left: L.side, right: L.side, top: 330, height: 390, padding: "40px 52px", scale: String(0.85 + 0.15 * card1), opacity: card1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <IconUsers size={60} />
          <div style={{ fontSize: 46, fontWeight: 900 }}>フォロワー</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
          <span style={{ fontSize: 60, fontWeight: 900, color: C.sub }}>約</span>
          <span style={{ fontFamily: ROUND, fontSize: 190, fontWeight: 900, color: C.blue, letterSpacing: -4, fontVariantNumeric: "tabular-nums", lineHeight: 1.05 }}>
            {countText(3433, count)}
          </span>
          <span style={{ fontSize: 64, fontWeight: 900 }}>人</span>
        </div>
        <div style={{ height: 26, borderRadius: 13, background: C.line, marginTop: 14, overflow: "hidden" }}>
          <div style={{ width: `${count * 100}%`, height: "100%", borderRadius: 13, background: `linear-gradient(90deg, ${C.sky}, ${C.blue})` }} />
        </div>
      </Card>

      {/* ストーリーズ閲覧数 */}
      <Card
        style={{
          position: "absolute",
          left: L.side,
          right: L.side,
          top: 760,
          height: 340,
          padding: "40px 52px",
          opacity: card2,
          translate: `${shake}px ${(1 - card2) * 120}px`,
          border: frame >= vReveal ? `6px solid ${C.coral}` : "6px solid transparent",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <IconEye size={60} />
          <div style={{ fontSize: 46, fontWeight: 900 }}>ストーリーズ閲覧数</div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: C.sub, marginTop: 0 }}>投稿から約20時間後</div>
        <div style={{ position: "relative", height: 150 }}>
          {frame < vReveal ? (
            <div style={{ fontFamily: ROUND, fontSize: 140, fontWeight: 900, color: C.line, scale: String(qPulse), transformOrigin: "left center", lineHeight: 1.1 }}>？</div>
          ) : (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, scale: String(interpolate(reveal, [0, 1], [2.2, 1])), transformOrigin: "left center", opacity: Math.min(1, reveal * 2) }}>
              <span style={{ fontFamily: ROUND, fontSize: 160, fontWeight: 900, color: C.coral, lineHeight: 1 }}>20</span>
              <span style={{ fontSize: 80, fontWeight: 900, color: C.coral }}>台</span>
            </div>
          )}
        </div>
        <div style={{ height: 26, borderRadius: 13, background: C.line, overflow: "hidden" }}>
          <div style={{ width: `${tinyBar * 1.2}%`, minWidth: tinyBar > 0 ? 10 : 0, height: "100%", borderRadius: 13, background: C.coral }} />
        </div>
      </Card>

      {/* 落差を示す矢印 */}
      <div
        style={{
          position: "absolute",
          left: 540 - 50,
          top: 700,
          width: 100,
          height: 80,
          opacity: interpolate(frame, [vReveal + 6, vReveal + 14], [0, 1], clamp),
          translate: `0px ${interpolate(frame, [vReveal + 6, vReveal + 20], [-20, 0], clamp)}px`,
        }}
      >
        <svg width={100} height={80} viewBox="0 0 100 80">
          <path d="M50 4v52" stroke={C.coral} strokeWidth={14} strokeLinecap="round" />
          <path d="M22 44l28 30 28-30" fill="none" stroke={C.coral} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
