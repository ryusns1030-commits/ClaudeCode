import data from "./timeline.json";

export type SceneId = "hook" | "problem" | "consult" | "ideas" | "truth" | "tips" | "ending";
export type EventName = keyof typeof data.events;

export const TL = data;
export const EV = data.events as Record<EventName, number>;

export const scene = (id: SceneId) => {
  const s = data.scenes.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return s;
};

/** シーン内の相対フレームに変換したイベント時刻 */
export const evIn = (id: SceneId, name: EventName) => EV[name] - scene(id).from;

/** 絶対フレームの母音（口パク用） */
export const mouthAt = (frame: number): string => data.mouth[frame] ?? "-";
