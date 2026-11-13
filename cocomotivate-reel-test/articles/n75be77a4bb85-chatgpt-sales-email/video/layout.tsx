/**
 * 共通レイアウト（既存 src/components/common.tsx の Background / ProgressBar / SceneTag / Subtitles / Watermark を
 * この記事の timeline に合わせて再構成したもの）。BudouX の Phrases と Card は共通部品をそのまま使う。
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, hash, pop } from "../../../src/anim";
import { Phrases } from "../../../src/components/common";
import { C, FONT, ROUND } from "../../../src/theme";
import { TL } from "./tl";

/** 3媒体共通セーフエリア（上200px・下330px・右の操作UI 132px を避ける） */
export const SAFE = {
  top: 200,
  bottom: 1590,
  left: 72,
  right: 1080 - 132,
  stageTop: 330,
  subTop: 1340,
  subBottom: 1590,
};
export const CONTENT_W = SAFE.right - SAFE.left;

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / 30;
  const gridShift = (frame * 0.6) % 90;
  const concl = TL.scenes.find((s) => s.id === "conclusion")!;
  const ending = TL.scenes.find((s) => s.id === "ending")!;
  // 結論シーンは背景の動きを止め、少し暗く締める
  const dim = interpolate(frame, [concl.from - 10, concl.from + 10, ending.from - 5, ending.from + 15], [0, 1, 1, 0], clamp);
  const motion = 1 - dim;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${C.bg2} 0%, ${C.bg1} 45%, ${C.bg0} 100%)` }}>
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          left: -300 + Math.sin(t * 0.4) * 80 * motion,
          top: -200 + Math.cos(t * 0.3) * 60 * motion,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(47,107,255,0.45), rgba(47,107,255,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          right: -380 + Math.cos(t * 0.35) * 70 * motion,
          bottom: -200 + Math.sin(t * 0.25) * 90 * motion,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(92,200,255,0.28), rgba(92,200,255,0))",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${gridShift}px`,
          maskImage: "linear-gradient(180deg, transparent 0%, black 25%, black 70%, transparent 100%)",
        }}
      />
      {new Array(16).fill(0).map((_, i) => {
        const x = hash(i) * 1080;
        const speed = (0.4 + hash(i + 50) * 0.8) * (0.3 + 0.7 * motion);
        const y = 1920 - ((frame * speed + hash(i + 99) * 1920) % 2000);
        const r = 3 + hash(i + 7) * 6;
        return (
          <div
            key={i}
            style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: "50%", background: C.glow, opacity: 0.12 + hash(i + 3) * 0.25 }}
          />
        );
      })}
      <AbsoluteFill style={{ background: "#020818", opacity: dim * 0.35 }} />
      <AbsoluteFill style={{ background: C.bg0, opacity: interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 0.6], clamp) }} />
    </AbsoluteFill>
  );
};

/** 上部：シーン進行バー（セーフエリア上端の内側） */
export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const n = TL.scenes.length;
  return (
    <div style={{ position: "absolute", top: 212, left: SAFE.left, width: CONTENT_W, display: "flex", gap: 10 }}>
      {TL.scenes.map((s, i) => {
        const p = interpolate(frame, [s.from, s.from + s.duration], [0, 1], clamp);
        return (
          <div key={s.id} style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", background: i === n - 1 ? C.glow : C.white }} />
          </div>
        );
      })}
    </div>
  );
};

export const SceneTag: React.FC<{ no: string; label: string }> = ({ no, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 2, 16);
  return (
    <div style={{ position: "absolute", top: 244, left: SAFE.left, display: "flex", alignItems: "center", gap: 14, opacity: s, translate: `${(1 - s) * -40}px 0px` }}>
      <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 30, color: C.navy, background: C.glow, borderRadius: 999, padding: "4px 18px" }}>{no}</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.92)", letterSpacing: 2 }}>{label}</div>
    </div>
  );
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** ナレーション同期字幕（BudouX + text-wrap: balance、強調語は script.json の emphasis） */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cur = TL.subtitles.find((s) => frame >= s.from - 3 && frame < s.to + 4);
  if (!cur) return null;
  const s = pop(frame, fps, cur.from - 3, 18, 220);
  const out = interpolate(frame, [cur.to, cur.to + 4], [1, 0], clamp);
  const hl = cur.emphasis.length ? new RegExp(`(${cur.emphasis.map(esc).join("|")})`) : undefined;
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.subTop,
        left: SAFE.left - 20,
        width: CONTENT_W + 40,
        height: SAFE.subBottom - SAFE.subTop,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: Math.min(s, out),
      }}
    >
      <div
        style={{
          maxWidth: CONTENT_W + 40,
          padding: "22px 38px",
          borderRadius: 30,
          background: "rgba(5,14,40,0.84)",
          border: "2px solid rgba(111,227,255,0.35)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
          color: C.white,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 54,
          lineHeight: 1.42,
          textAlign: "center",
          wordBreak: "keep-all",
          textWrap: "balance",
          scale: String(0.92 + 0.08 * s),
          translate: `0px ${(1 - s) * 16}px`,
        }}
      >
        {/* subLines（台本で指定した改行位置）があれば行ごとに BudouX を適用し、なければ全体を BudouX で折り返す */}
        {(cur.subLines.length ? cur.subLines : [cur.text]).map((ln, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            <Phrases text={ln} highlight={hl} hlColor={cur.emphasisColor === "coral" ? C.coral : C.glow} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/** ブランド表記（エンディング前まで右上に小さく） */
export const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const ending = TL.scenes.find((s) => s.id === "ending")!;
  const o = interpolate(frame, [ending.from - 10, ending.from], [0.7, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 248, right: 1080 - SAFE.right, fontFamily: ROUND, fontWeight: 900, fontSize: 28, color: C.white, opacity: o, letterSpacing: 1 }}>
      Co.Co.Motivate
    </div>
  );
};

/** 小さな注記（※イメージです 等） */
export const Note: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.78)", ...style }}>{children}</div>
);
