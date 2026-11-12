import { Easing, interpolate, spring } from "remotion";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** start から dur フレームで 0→1（イーズアウト） */
export const prog = (frame: number, start: number, dur = 18, ease = easeOut) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: ease });

/** バネ（登場用） */
export const pop = (frame: number, fps: number, start: number, damping = 13, stiffness = 160) =>
  spring({ frame: frame - start, fps, config: { damping, stiffness, mass: 0.8 } });

/** 決定論的な擬似乱数（フレームベース演出用） */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
