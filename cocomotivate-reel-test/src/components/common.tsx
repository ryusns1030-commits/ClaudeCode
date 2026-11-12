import { loadDefaultJapaneseParser } from "budoux";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOut, hash, pop } from "../anim";
import { C, FONT, L, ROUND } from "../theme";
import { TL } from "../timeline";

const parser = loadDefaultJapaneseParser();

/** BudouX で文節ごとに改行可能位置を入れる（日本語の不自然な改行を防ぐ） */
export const Phrases: React.FC<{ text: string; highlight?: RegExp; hlColor?: string }> = ({
  text,
  highlight,
  hlColor = C.glow,
}) => {
  const parts = parser.parse(text);
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          <span style={{ whiteSpace: "nowrap" }}>
            {highlight
              ? p.split(highlight).map((seg, j) =>
                  j % 2 === 1 ? (
                    <span key={j} style={{ color: hlColor }}>
                      {seg}
                    </span>
                  ) : (
                    seg
                  ),
                )
              : p}
          </span>
          <wbr />
        </React.Fragment>
      ))}
    </>
  );
};

/** 背景：ネイビーのグラデーション + ゆっくり流れるグリッド + 光の粒 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / 30;
  const gridShift = (frame * 0.6) % 90;
  const truth = TL.scenes.find((s) => s.id === "truth")!;
  const ending = TL.scenes.find((s) => s.id === "ending")!;
  // 結論シーンは少し暗く・締まった空気に
  const dim = interpolate(frame, [truth.from - 10, truth.from + 10, ending.from - 5, ending.from + 15], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${C.bg2} 0%, ${C.bg1} 45%, ${C.bg0} 100%)` }}>
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          left: -300 + Math.sin(t * 0.4) * 80,
          top: -200 + Math.cos(t * 0.3) * 60,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(47,107,255,0.45), rgba(47,107,255,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          right: -380 + Math.cos(t * 0.35) * 70,
          bottom: -200 + Math.sin(t * 0.25) * 90,
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
      {new Array(18).fill(0).map((_, i) => {
        const x = hash(i) * 1080;
        const speed = 0.4 + hash(i + 50) * 0.8;
        const y = 1920 - ((frame * speed + hash(i + 99) * 1920) % 2000);
        const r = 3 + hash(i + 7) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r,
              height: r,
              borderRadius: "50%",
              background: C.glow,
              opacity: 0.15 + hash(i + 3) * 0.3,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: "#020818", opacity: dim * 0.35 }} />
      {/* フェードイン/アウト（黒画面にならない程度に） */}
      <AbsoluteFill
        style={{ background: C.bg0, opacity: interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 0.6], clamp) }}
      />
    </AbsoluteFill>
  );
};

/** 上部：ストーリーズ風のシーン進行バー + 見出し */
export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const n = TL.scenes.length;
  return (
    <div style={{ position: "absolute", top: 196, left: L.side, right: L.side, display: "flex", gap: 10 }}>
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

/** シーンの小見出しチップ（上部） */
export const SceneTag: React.FC<{ no: string; label: string }> = ({ no, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 2, 16);
  return (
    <div
      style={{
        position: "absolute",
        top: 236,
        left: L.side,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: s,
        translate: `${(1 - s) * -40}px 0px`,
      }}
    >
      <div style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 30, color: C.navy, background: C.glow, borderRadius: 999, padding: "4px 18px" }}>
        {no}
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.9)", letterSpacing: 2 }}>{label}</div>
    </div>
  );
};

const HL = /([0-9][0-9,〜]*(?:人|台|枚|時間|月|日|年)?|ChatGPT|2択)/;

/** ナレーション同期字幕（音声の実測長から算出したフレームで表示） */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cur = TL.subtitles.find((s) => frame >= s.from - 3 && frame < s.to + 4);
  if (!cur) return null;
  // 最後の決め台詞は画面中央の大見出しとして同期表示するため字幕帯は出さない
  if (cur.text.startsWith("AIで考え")) return null;
  const s = pop(frame, fps, cur.from - 3, 18, 220);
  const out = interpolate(frame, [cur.to, cur.to + 4], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: L.subTop,
        left: 0,
        right: 0,
        height: L.subBottom - L.subTop,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: Math.min(s, out),
      }}
    >
      <div
        style={{
          maxWidth: 940,
          padding: "22px 40px",
          borderRadius: 30,
          background: "rgba(5,14,40,0.82)",
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
        <Phrases text={cur.text} highlight={HL} />
      </div>
    </div>
  );
};

export const Card: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties }>> = ({ children, style }) => (
  <div
    style={{
      background: C.white,
      borderRadius: 36,
      boxShadow: "0 24px 60px rgba(0,6,30,0.45)",
      color: C.ink,
      fontFamily: FONT,
      ...style,
    }}
  >
    {children}
  </div>
);

/** ブランド表記（右下の小さなウォーターマーク） */
export const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const ending = TL.scenes.find((s) => s.id === "ending")!;
  const o = interpolate(frame, [0, 15, ending.from - 10, ending.from], [0, 0.7, 0.7, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        right: L.side,
        fontFamily: ROUND,
        fontWeight: 900,
        fontSize: 30,
        color: C.white,
        opacity: o,
        letterSpacing: 1,
      }}
    >
      Co.Co.Motivate
    </div>
  );
};

/** 0→1 の進捗で数字をカウントアップ表示 */
export const countText = (value: number, p: number) =>
  Math.round(value * interpolate(p, [0, 1], [0, 1], { ...clamp, easing: easeOut })).toLocaleString("en-US");
