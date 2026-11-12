import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeInOut, hash } from "../anim";
import { EV, mouthAt, scene } from "../timeline";
import { CharacterSVG, DEFAULT_LEFT, DEFAULT_RIGHT, Expression, Hand } from "./CharacterSVG";

type Pose = "idle" | "wave" | "think" | "pointL" | "pointR" | "cheer" | "shock";
type Key = { f: number; x: number; y: number; s: number; expr: Expression; pose: Pose; dur?: number };

const sf = (id: Parameters<typeof scene>[0]) => scene(id).from;

/** 全編を通して画面上を移動するナビゲーターのキーフレーム（絶対フレーム） */
const KEYS: Key[] = [
  // 0フレーム目から画面内にいて、すぐ跳ねて登場
  { f: 0, x: 880, y: 1700, s: 0.5, expr: "normal", pose: "idle" },
  { f: 1, x: 880, y: 1320, s: 0.5, expr: "normal", pose: "pointL", dur: 12 },
  { f: EV.viewsReveal - 2, x: 880, y: 1315, s: 0.54, expr: "surprised", pose: "shock", dur: 8 },
  { f: EV.followersCount + 30, x: 880, y: 1320, s: 0.5, expr: "thinking", pose: "think", dur: 12 },
  { f: EV.consultSay - 6, x: 880, y: 1320, s: 0.5, expr: "happy", pose: "pointL", dur: 12 },
  { f: sf("problem") + 4, x: 900, y: 1310, s: 0.5, expr: "thinking", pose: "think", dur: 20 },
  { f: sf("consult") + 4, x: 900, y: 1310, s: 0.5, expr: "normal", pose: "idle", dur: 16 },
  { f: EV.chatOpen, x: 900, y: 1310, s: 0.5, expr: "happy", pose: "pointL", dur: 12 },
  { f: sf("ideas") + 4, x: 900, y: 1310, s: 0.5, expr: "happy", pose: "pointL", dur: 18 },
  { f: EV.idea3 + 6, x: 900, y: 1310, s: 0.5, expr: "happy", pose: "cheer", dur: 10 },
  { f: sf("truth") + 4, x: 900, y: 1310, s: 0.5, expr: "serious", pose: "idle", dur: 16 },
  { f: EV.notConfirmed - 2, x: 900, y: 1300, s: 0.52, expr: "surprised", pose: "shock", dur: 8 },
  { f: EV.notConfirmed + 22, x: 900, y: 1310, s: 0.5, expr: "serious", pose: "think", dur: 10 },
  // コツのシーンはカードを広く見せるため一旦退場
  { f: sf("tips") - 6, x: 900, y: 2300, s: 0.5, expr: "happy", pose: "wave", dur: 16 },
  { f: sf("ending") - 4, x: 540, y: 2300, s: 0.62, expr: "happy", pose: "idle", dur: 1 },
  { f: sf("ending"), x: 540, y: 1320, s: 0.62, expr: "happy", pose: "wave", dur: 22 },
  { f: EV.final2, x: 540, y: 1320, s: 0.62, expr: "happy", pose: "cheer", dur: 10 },
  { f: EV.practice + 30, x: 540, y: 1320, s: 0.62, expr: "happy", pose: "wave", dur: 10 },
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
      return [idleL, { x: 372 + bobR * 0.8, y: 250, rot: 70 }];
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
    default:
      return [idleL, idleR];
  }
};

const lerpHand = (a: Hand, b: Hand, p: number): Hand => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
  rot: a.rot + (b.rot - a.rot) * p,
});

/** 決定論的なまばたき: 約2.6〜4秒おきに6フレームかけて閉じて開く */
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

  // 現在と直前のキー
  let i = 0;
  while (i + 1 < KEYS.length && KEYS[i + 1].f <= frame) i++;
  const cur = KEYS[i];
  const prev = KEYS[Math.max(0, i - 1)];
  const dur = cur.dur ?? 16;
  const p = i === 0 ? 1 : interpolate(frame, [cur.f, cur.f + dur], [0, 1], { ...clamp, easing: easeInOut });
  // 位置はバネで少しオーバーシュート
  const sp = i === 0 ? 1 : spring({ frame: frame - cur.f, fps, durationInFrames: dur + 8, config: { damping: 14, stiffness: 120 } });
  const x = prev.x + (cur.x - prev.x) * sp;
  const y = prev.y + (cur.y - prev.y) * sp;
  const s = prev.s + (cur.s - prev.s) * p;

  const [pl, pr] = handsFor(prev.pose, frame);
  const [cl, cr] = handsFor(cur.pose, frame);
  const leftHand = lerpHand(pl, cl, p);
  const rightHand = lerpHand(pr, cr, p);

  // 表情はキーの瞬間に切替え、切替直後に軽くスクワッシュ
  const sinceChange = frame - cur.f;
  const squash =
    1 +
    (cur.expr !== prev.expr ? interpolate(sinceChange, [0, 4, 10, 18], [0, 0.07, -0.03, 0], clamp) : 0);

  // 体の上下運動（浮遊）
  const t = frame / fps;
  const bob = Math.sin(t * 2 * Math.PI * 0.55) * 10;
  const tiltBase =
    cur.expr === "thinking" ? 6 : cur.expr === "surprised" ? -3 * Math.sin(sinceChange * 0.9) * Math.exp(-sinceChange / 10) : 0;
  const tilt = tiltBase + Math.sin(t * 2 * Math.PI * 0.35) * 2;

  // 口パク：ナレーションの母音タイミングに同期
  // モーラ間の短い隙間（子音部など）は口を閉じ切らず小さく保ち、ちらつきを防ぐ
  let mouth = mouthAt(frame);
  if (mouth === "-") {
    const near = [-2, -1, 1, 2].some((d) => mouthAt(frame + d) !== "-") && mouthAt(frame - 1) !== "-" || (mouthAt(frame - 1) !== "-" && mouthAt(frame + 1) !== "-");
    if (near) mouth = "n";
  }
  // 話している間は視線をわずかに動かす
  const look =
    cur.expr === "thinking"
      ? { x: 8, y: -10 }
      : cur.pose === "pointL"
        ? { x: -10, y: -2 }
        : cur.pose === "pointR"
          ? { x: 10, y: -2 }
          : { x: Math.sin(t * 1.3) * 3, y: 0 };

  const antenna = cur.expr === "surprised" ? 1 : 0.35 + 0.25 * Math.sin(t * 2 * Math.PI * 1.1);

  const W = 400 * s;
  const H = 480 * s;
  // 影
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
