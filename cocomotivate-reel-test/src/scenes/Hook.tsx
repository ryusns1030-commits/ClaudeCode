import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, pop, prog } from "../anim";
import { Card, countText } from "../components/common";
import { IconEye, IconSpark, IconUsers } from "../components/icons";
import { C, FONT, L, ROUND } from "../theme";
import { evIn } from "../timeline";

/**
 * シーン1：最初の2秒で掴む。
 * 0フレーム目から閲覧数カードが画面にあり、1.6秒の発話「にじゅうだい」と同時に「20台」が着地する。
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vReveal = evIn("hook", "viewsReveal");
  const cStart = evIn("hook", "followersCount");
  const eConsult = evIn("hook", "consultSay");

  // 0フレーム目から見えている（不透明度1）。大きさだけ少し跳ねる
  const enter = pop(frame, fps, 0, 12, 220);
  const reveal = pop(frame, fps, vReveal, 9, 260);
  const shake = frame >= vReveal ? Math.sin((frame - vReveal) * 2.2) * 16 * Math.exp(-(frame - vReveal) / 6) : 0;
  const flash = frame >= vReveal ? interpolate(frame - vReveal, [0, 3, 14], [0, 0.6, 0], clamp) : 0;
  const qPulse = 1 + Math.sin(frame * 0.5) * 0.08;
  const tinyBar = prog(frame, vReveal + 4, 14);

  const card2 = pop(frame, fps, cStart - 14, 14);
  const count = prog(frame, cStart, 24);
  const arrow = prog(frame, cStart + 26, 10);
  const banner = pop(frame, fps, eConsult - 12, 14);

  return (
    <AbsoluteFill>
      {/* 0フレーム目から表示される問いかけ */}
      <div style={{ position: "absolute", top: 232, left: L.side, right: L.side, display: "flex", alignItems: "center", gap: 14, scale: String(0.94 + 0.06 * enter), transformOrigin: "left center" }}>
        <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 30, color: C.navy, background: C.glow, borderRadius: 999, padding: "4px 18px" }}>2026年11月</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.white }}>ある Instagram アカウントの話</div>
      </div>

      {/* ストーリーズ閲覧数（主役） */}
      <Card
        style={{
          position: "absolute",
          left: L.side,
          right: L.side,
          top: 320,
          height: 420,
          padding: "40px 52px",
          scale: String(1.06 - 0.06 * enter),
          translate: `${shake}px 0px`,
          border: frame >= vReveal ? `7px solid ${C.coral}` : `7px solid ${C.white}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <IconEye size={64} />
          <div style={{ fontSize: 50, fontWeight: 900 }}>ストーリーズ閲覧数</div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: C.sub }}>投稿から約20時間後</div>
        <div style={{ height: 200, display: "flex", alignItems: "center" }}>
          {frame < vReveal ? (
            <div style={{ fontFamily: ROUND, fontSize: 170, fontWeight: 900, color: C.blue, scale: String(qPulse), lineHeight: 1 }}>？</div>
          ) : (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, scale: String(interpolate(reveal, [0, 1], [2.4, 1])), transformOrigin: "left center", opacity: Math.min(1, reveal * 2) }}>
              <span style={{ fontFamily: ROUND, fontSize: 210, fontWeight: 900, color: C.coral, lineHeight: 1 }}>20</span>
              <span style={{ fontSize: 96, fontWeight: 900, color: C.coral }}>台</span>
            </div>
          )}
        </div>
        <div style={{ height: 24, borderRadius: 12, background: C.line, overflow: "hidden" }}>
          <div style={{ width: `${tinyBar * 1.2}%`, minWidth: tinyBar > 0 ? 10 : 0, height: "100%", borderRadius: 12, background: C.coral }} />
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 30, background: C.coral, opacity: flash, pointerEvents: "none" }} />
      </Card>

      {/* 0フレーム目から見える「最後まで見る理由」の予告 */}
      <div style={{ position: "absolute", left: L.side, right: L.side, top: 820, display: "flex", justifyContent: "center", opacity: 1 - card2, scale: String(1 - 0.1 * card2) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(5,14,40,0.75)", border: `4px solid ${C.glow}`, borderRadius: 34, padding: "26px 40px", rotate: `${Math.sin(frame * 0.18) * 1.2}deg` }}>
          <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 92, color: C.glow, lineHeight: 1 }}>3</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.white, lineHeight: 1.35 }}>
            最後に<span style={{ color: C.glow }}>「AI活用のコツ」</span>
            <br />
            を3つ紹介します
          </div>
        </div>
      </div>

      {/* フォロワー（落差の比較対象） */}
      <Card style={{ position: "absolute", left: L.side, right: L.side, top: 790, height: 300, padding: "30px 52px", opacity: card2, translate: `0px ${(1 - card2) * 100}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <IconUsers size={54} />
          <div style={{ fontSize: 44, fontWeight: 900 }}>フォロワー</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 54, fontWeight: 900, color: C.sub }}>約</span>
          <span style={{ fontFamily: ROUND, fontSize: 150, fontWeight: 900, color: C.blue, letterSpacing: -3, fontVariantNumeric: "tabular-nums", lineHeight: 1.05 }}>
            {countText(3433, count)}
          </span>
          <span style={{ fontSize: 56, fontWeight: 900 }}>人</span>
        </div>
        <div style={{ height: 24, borderRadius: 12, background: C.line, overflow: "hidden" }}>
          <div style={{ width: `${count * 100}%`, height: "100%", borderRadius: 12, background: `linear-gradient(90deg, ${C.sky}, ${C.blue})` }} />
        </div>
      </Card>

      {/* 落差の矢印（フォロワー → 閲覧数） */}
      <div style={{ position: "absolute", left: 540 - 50, top: 728, width: 100, height: 70, opacity: arrow, scale: String(0.6 + 0.4 * arrow) }}>
        <svg width={100} height={70} viewBox="0 0 100 70">
          <path d="M50 66V14" stroke={C.coral} strokeWidth={14} strokeLinecap="round" />
          <path d="M22 34L50 6l28 28" fill="none" stroke={C.coral} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ChatGPTに相談 */}
      <div style={{ position: "absolute", left: L.side, top: 1130, display: "flex", alignItems: "center", gap: 16, opacity: banner, translate: `${(1 - banner) * -80}px 0px`, background: C.navy, border: `3px solid ${C.glow}`, borderRadius: 999, padding: "14px 34px 14px 18px" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.glow, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconSpark size={36} color={C.navy} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: C.white }}>ChatGPTに相談して見直し</div>
      </div>
    </AbsoluteFill>
  );
};
