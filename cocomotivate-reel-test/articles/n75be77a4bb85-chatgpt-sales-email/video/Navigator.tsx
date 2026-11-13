/**
 * ナビゲーター（既存キャラクター「ココナビ」）をこの記事のタイムラインで動かす。
 * 描画は共通の CharacterSVG、動きの仕組み（キーフレーム・まばたき・母音口パク・スクワッシュ・浮遊）は
 * 既存 src/character/Navigator.tsx と同じ。キーフレームだけを記事用に定義する。
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeInOut, hash } from "../../../src/anim";
import { CharacterSVG, DEFAULT_LEFT, DEFAULT_RIGHT, Expression, Hand } from "../../../src/character/CharacterSVG";
import { EV, mouthAt, scene } from "./tl";

type Pose = "idle" | "wave" | "think" | "pointL" | "pointR" | "cheer" | "shock" | "stop";
type Key = { f: number; x: number; y: number; s: number; expr: Expression; pose: Pose; dur?: number };

const sf = (id: Parameters<typeof scene>[0]) => scene(id).from;
// 定位置：右下（カード・字幕帯・右端の操作UIを避ける）。足元 y=1300、スケール0.5で x=754〜946, y≈1060〜1300 を占める
const HX = 850;
const HY = 1300;
const OFF = 2350;

const KEYS: Key[] = [
  { f: 0, x: HX, y: OFF, s: 0.5, expr: "normal", pose: "idle" },
  // 「送ってない？」の瞬間に飛び込んで制止
  { f: EV.waitStamp - 8, x: HX, y: HY, s: 0.52, expr: "surprised", pose: "stop", dur: 10 },
  { f: EV.promise3 - 4, x: HX, y: HY, s: 0.5, expr: "happy", pose: "pointL", dur: 12 },
  { f: sf("experience") + 4, x: HX, y: HY, s: 0.5, expr: "thinking", pose: "think", dur: 16 },
  { f: EV.chatTyping, x: HX, y: HY, s: 0.5, expr: "normal", pose: "pointL", dur: 12 },
  { f: EV.meritHighlight - 2, x: HX, y: HY - 6, s: 0.52, expr: "happy", pose: "pointL", dur: 10 },
  { f: EV.apologyCard, x: HX, y: HY, s: 0.5, expr: "normal", pose: "pointL", dur: 12 },
  { f: EV.unconfirmedStamp - 2, x: HX, y: HY - 4, s: 0.52, expr: "surprised", pose: "shock", dur: 8 },
  { f: EV.unconfirmedStamp + 12, x: HX, y: HY, s: 0.5, expr: "serious", pose: "idle", dur: 10 },
  { f: EV.draftLabel + 4, x: HX, y: HY, s: 0.5, expr: "serious", pose: "think", dur: 12 },
  { f: sf("prompt") + 2, x: HX, y: HY, s: 0.5, expr: "happy", pose: "wave", dur: 14 },
  { f: EV.cond1 - 4, x: HX, y: HY, s: 0.5, expr: "normal", pose: "pointL", dur: 10 },
  { f: EV.cond2 - 4, x: HX, y: HY - 6, s: 0.5, expr: "serious", pose: "pointL", dur: 10 },
  { f: EV.cond3 - 4, x: HX, y: HY, s: 0.5, expr: "happy", pose: "pointL", dur: 10 },
  // チェックリストを広く見せるため退場
  { f: sf("check") - 4, x: HX + 40, y: OFF, s: 0.5, expr: "happy", pose: "wave", dur: 16 },
  // 結論で再登場
  { f: sf("conclusion") + 2, x: HX, y: HY, s: 0.5, expr: "serious", pose: "idle", dur: 18 },
  { f: EV.splitCompare + 2, x: HX, y: HY, s: 0.5, expr: "thinking", pose: "think", dur: 12 },
  { f: EV.humanJudge - 2, x: HX, y: HY - 6, s: 0.52, expr: "happy", pose: "cheer", dur: 10 },
  { f: sf("ending") - 2, x: 540, y: HY, s: 0.56, expr: "happy", pose: "wave", dur: 20 },
  { f: EV.saveIcon + 2, x: 540, y: HY, s: 0.56, expr: "happy", pose: "pointR", dur: 10 },
  { f: EV.saveIcon + 40, x: 540, y: HY, s: 0.56, expr: "happy", pose: "wave", dur: 12 },
];

const handsFor = (pose: Pose, frame: number): [Hand, Hand] => {
  const t = frame / 30;
  const bobL = Math.sin(t * 2 * Math.PI * 0.7) * 6;
  const bobR = Math.sin(t * 2 * Math.PI * 0.7 + 1.3) * 6;
  const idleL = { ...DEFAULT_LEFT, y: DEFAULT_LEFT.y + bobL };
  const idleR = { ...DEFAULT_RIGHT, y: DEFAULT_RIGHT.y + bobR };
  switch (pose) {
    case "wave": {
      const w = Math.sin(t * 2 * Math.PI * 2.2);
      return [idleL, { x: 336 + w * 12, y: 196 + Math.abs(w) * 6, rot: 18 + w * 26 }];
    }
    case "think":
      return [{ x: 168, y: 268 + bobL * 0.3, rot: -40 }, idleR];
    case "pointL":
      return [{ x: 30 + bobL * 0.8, y: 250, rot: -70 }, idleR];
    case "pointR":
      return [idleL, { x: 340 + bobR * 0.6, y: 150, rot: 40 }];
    case "cheer": {
      const w = Math.sin(t * 2 * Math.PI * 1.6);
      return [
        { x: 66, y: 178 + w * 10, rot: -20 },
        { x: 334, y: 178 - w * 10, rot: 20 },
      ];
    }
    case "shock":
      return [
        { x: 84, y: 214, rot: -30 },
        { x: 316, y: 214, rot: 30 },
      ];
    case "stop":
      // 手のひらを前に出して「待って」
      return [{ x: 40, y: 220, rot: -88 }, idleR];
    default:
      return [idleL, idleR];
  }
};

const lerpHand = (a: Hand, b: Hand, p: number): Hand => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
  rot: a.rot + (b.rot - a.rot) * p,
});

/** 決定論的なまばたき: 約2.6〜4秒おきに6フレーム */
const blinkAt = (frame: number) => {
  let t = 20;
  let k = 0;
  while (t + 6 < frame) {
    t += 78 + Math.floor(hash(k) * 42);
    k++;
  }
  const d = frame - t;
  if (d < 0 || d > 6) return 0;
  return [0.3, 0.8, 1, 1, 0.7, 0.3, 0][d];
};

export const Navigator: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let i = 0;
  while (i + 1 < KEYS.length && KEYS[i + 1].f <= frame) i++;
  const cur = KEYS[i];
  const prev = KEYS[Math.max(0, i - 1)];
  const dur = cur.dur ?? 16;
  const p = i === 0 ? 1 : interpolate(frame, [cur.f, cur.f + dur], [0, 1], { ...clamp, easing: easeInOut });
  const sp = i === 0 ? 1 : spring({ frame: frame - cur.f, fps, durationInFrames: dur + 8, config: { damping: 14, stiffness: 120 } });
  const x = prev.x + (cur.x - prev.x) * sp;
  const y = prev.y + (cur.y - prev.y) * sp;
  const s = prev.s + (cur.s - prev.s) * p;

  const [pl, pr] = handsFor(prev.pose, frame);
  const [cl, cr] = handsFor(cur.pose, frame);
  const leftHand = lerpHand(pl, cl, p);
  const rightHand = lerpHand(pr, cr, p);

  const sinceChange = frame - cur.f;
  const squash = 1 + (cur.expr !== prev.expr ? interpolate(sinceChange, [0, 4, 10, 18], [0, 0.07, -0.03, 0], clamp) : 0);

  const t = frame / fps;
  const bob = Math.sin(t * 2 * Math.PI * 0.55) * 10;
  const tiltBase =
    cur.expr === "thinking" ? 6 : cur.expr === "surprised" ? -3 * Math.sin(sinceChange * 0.9) * Math.exp(-sinceChange / 10) : 0;
  const tilt = tiltBase + Math.sin(t * 2 * Math.PI * 0.35) * 2;

  // 母音口パク（短い隙間は小さく閉じた口を保ってちらつきを防ぐ）
  let mouth = mouthAt(frame);
  if (mouth === "-") {
    const near =
      ([-2, -1, 1, 2].some((d) => mouthAt(frame + d) !== "-") && mouthAt(frame - 1) !== "-") ||
      (mouthAt(frame - 1) !== "-" && mouthAt(frame + 1) !== "-");
    if (near) mouth = "n";
  }
  const look =
    cur.expr === "thinking"
      ? { x: 8, y: -10 }
      : cur.pose === "pointL" || cur.pose === "stop"
        ? { x: -10, y: -2 }
        : cur.pose === "pointR"
          ? { x: 10, y: -6 }
          : { x: Math.sin(t * 1.3) * 3, y: 0 };
  const antenna = cur.expr === "surprised" ? 1 : 0.35 + 0.25 * Math.sin(t * 2 * Math.PI * 1.1);

  const W = 400 * s;
  const H = 480 * s;
  const shadowOpacity = interpolate(y, [1300, 1700], [0.35, 0], clamp);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x - W * 0.45,
          top: y - 18 * s,
          width: W * 0.9,
          height: 30 * s,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(0,8,30,0.55), rgba(0,8,30,0))",
          opacity: shadowOpacity,
          scale: String(1 - bob / 80),
        }}
      />
      <div style={{ position: "absolute", left: x - W / 2, top: y - H + bob - 20 * s, width: W, height: H }}>
        <CharacterSVG
          width={W}
          height={H}
          blink={cur.expr === "happy" ? 0 : blinkAt(frame)}
          mouth={mouth}
          expression={cur.expr}
          look={look}
          tilt={tilt}
          antenna={antenna}
          leftHand={leftHand}
          rightHand={rightHand}
          squash={squash}
        />
      </div>
    </AbsoluteFill>
  );
};
