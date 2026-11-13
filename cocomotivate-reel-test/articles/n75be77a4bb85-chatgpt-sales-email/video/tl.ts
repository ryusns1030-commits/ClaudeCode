// この記事の timeline.json（scripts/article/make_audio.py が音声の実測値から生成）
import data from "../deliverables/timeline.json";

export type SceneId = "hook" | "experience" | "prompt" | "check" | "conclusion" | "ending";
export type EventName = keyof typeof data.events;

export const TL = data;
export const SLUG = "n75be77a4bb85-chatgpt-sales-email";
export const EV = data.events as Record<EventName, number>;

export const scene = (id: SceneId) => {
  const s = data.scenes.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return s;
};

/** シーン内の相対フレームに変換したイベント時刻 */
export const evIn = (id: SceneId, name: EventName) => EV[name] - scene(id).from;

/** 字幕（行）の開始フレーム（シーン内相対） */
export const lineIn = (id: SceneId, lineId: string) => {
  const s = data.subtitles.find((x) => x.id === lineId);
  if (!s) throw new Error(lineId);
  return s.from - scene(id).from;
};

/** 絶対フレームの母音（口パク用） */
export const mouthAt = (frame: number): string => data.mouth[frame] ?? "-";
