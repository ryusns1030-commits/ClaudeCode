"""記事フォルダ用：ナレーションを並べて timeline.json を作り、オリジナルBGM・効果音を合成してミックスする。

使い方:  .venv/bin/python scripts/article/make_audio.py articles/<slug>
入力:    articles/<slug>/planning/script.json（台本・cues）, articles/<slug>/build/voice/*.wav, meta.json
出力:    articles/<slug>/deliverables/timeline.json   シーン/字幕/演出キュー/口パク（すべてフレーム単位）
         articles/<slug>/deliverables/master.wav      最終ミックス（48kHz stereo）
         public/articles/<slug>/master.wav           Remotion 読み込み用のコピー

既存の scripts/make_audio.py（初回リール用）と同じ合成方式（numpy による手続き的合成。外部素材なし）。
違い：演出キューを script.json の "cues" から読む／効果音を cue の "sfx" で決める／記事ごとに出力先を分ける。
"""
import json
import os
import re
import shutil
import subprocess
import sys
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ART = os.path.abspath(sys.argv[1])
SLUG = os.path.basename(ART)
SR = 48000
FPS = 30
rng = np.random.default_rng(7)

cfg = json.load(open(os.path.join(ART, "planning", "script.json"), encoding="utf-8"))
meta = json.load(open(os.path.join(ART, "build", "voice", "meta.json"), encoding="utf-8"))
OUT = os.path.join(ART, "deliverables")
os.makedirs(OUT, exist_ok=True)


def read_wav(p):
    with wave.open(p) as w:
        assert w.getframerate() == SR, w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(1)
    return x


def norm(k):
    k = re.sub(r"['/_、？。]", "", k)
    return k.replace("ー", "").replace("ウ", "オ").replace("イ", "エ")


# ---------------------------------------------------------------- タイムライン
HOLD = {s["id"]: s.get("holdAfterSec", 0.0) for s in cfg["scenes"]}
lines = []
t = cfg["leadInSec"]
prev_scene = None
scene_first = {}
for m in meta:
    if prev_scene is not None:
        t += (cfg["sceneGapSec"] + HOLD.get(prev_scene, 0.0)) if m["scene"] != prev_scene else cfg["gapSec"]
    lines.append({**m, "start": t, "end": t + m["duration"]})
    scene_first.setdefault(m["scene"], t)
    prev_scene = m["scene"]
    t += m["duration"]
speech_end = t
total_sec = t + cfg["tailSec"]
total_frames = int(np.ceil(total_sec * FPS))
by_id = {L["id"]: L for L in lines}


def f(sec):
    return int(round(sec * FPS))


def cue_sec(line_id, kana, occ=0):
    """行内で読み kana が始まるモーラの母音開始時刻（絶対秒）。"""
    L = by_id[line_id]
    parts = [norm(m[5]) for m in L["moras"]]
    joined = "".join(parts)
    kw = norm(kana)
    pos = joined.find(kw) if occ == 0 else joined.rfind(kw)
    assert pos >= 0, (line_id, kana, joined)
    acc = 0
    for i, p in enumerate(parts):
        if acc + len(p) > pos:
            m = L["moras"][i]
            return L["start"] + m[0] - m[3]  # 子音の頭（発話の瞬間）
        acc += len(p)
    raise AssertionError((line_id, kana))


events, sfx_plan = {}, []
for c in cfg["cues"]:
    sec = cue_sec(c["line"], c["kana"], c.get("occ", 0)) + c.get("offsetSec", 0.0)
    events[c["name"]] = f(sec)
    sfx_plan.append((c.get("sfx"), sec, c["name"]))
    th = c.get("then")
    if th:
        for k in range(th["count"]):
            s2 = sec + th.get("delaySec", 0.0) + k * th["intervalSec"]
            events[f"{th['stagger']}{k}"] = f(s2)
            sfx_plan.append((th.get("sfx"), s2, f"{th['stagger']}{k}"))

scene_ids = [s["id"] for s in cfg["scenes"]]
scenes = []
for i, sid in enumerate(scene_ids):
    start = 0 if i == 0 else f(scene_first[sid] - 0.3)
    scenes.append({"id": sid, "from": start})
for i, s in enumerate(scenes):
    s["duration"] = (scenes[i + 1]["from"] if i + 1 < len(scenes) else total_frames) - s["from"]

# 口パク: フレームごとの母音 (a,i,u,e,o, n=閉じ気味, -=無音)
VOW = {"a": "a", "i": "i", "u": "u", "e": "e", "o": "o", "A": "a", "I": "i", "U": "u",
       "E": "e", "O": "o", "N": "n", "cl": "-", "pau": "-"}
mouth = ["-"] * total_frames
for L in lines:
    for (s, e, v, *_rest) in L["moras"]:
        a, b = L["start"] + s, L["start"] + e
        fa, fb = int(np.floor(a * FPS)), int(np.ceil(b * FPS))
        for fr in range(fa, min(fb, total_frames)):
            c = (fr + 0.5) / FPS
            if a <= c < b or fb - fa <= 1:
                mouth[fr] = VOW.get(v, "-")

# 字幕の強調語（script.json の emphasis）
line_cfg = {l["id"]: l for s in cfg["scenes"] for l in s["lines"]}
timeline = {
    "fps": FPS,
    "durationInFrames": total_frames,
    "durationSec": round(total_frames / FPS, 3),
    "speechEndFrame": f(speech_end),
    "scenes": scenes,
    "subtitles": [{"id": L["id"], "text": L["sub"], "from": f(L["start"]), "to": f(L["end"]), "scene": L["scene"],
                   "subLines": line_cfg[L["id"]].get("subLines", []),
                   "emphasis": line_cfg[L["id"]].get("emphasis", []),
                   "emphasisColor": line_cfg[L["id"]].get("emphasisColor", "cyan")} for L in lines],
    "lines": [{"id": L["id"], "startSec": round(L["start"], 3), "endSec": round(L["end"], 3), "kana": L["kana"],
               "moras": [{"t": round(L["start"] + m[0] - m[3], 3), "vowelStart": round(L["start"] + m[0], 3),
                          "end": round(L["start"] + m[1], 3), "consonantSec": round(m[3], 4),
                          "vowelSec": round(m[4], 4), "vowel": m[2], "text": m[5]} for m in L["moras"]]}
              for L in lines],
    "events": events,
    "mouth": "".join(mouth),
    "voice": {"engine": "VOICEVOX", "speaker": cfg["speakerName"], "credit": cfg["voice"]["credit"],
              "speedScale": cfg["speedScale"], "intonationScale": cfg["intonationScale"], "samplingRate": SR},
}
json.dump(timeline, open(os.path.join(OUT, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False)

# ---------------------------------------------------------------- ナレーション
N = int(total_sec * SR) + SR
voice = np.zeros(N, np.float32)
for L in lines:
    x = read_wav(os.path.join(ART, "build", "voice", f"{L['index']:02d}.wav"))
    i = int(L["start"] * SR)
    voice[i:i + len(x)] += x
voice *= 0.89 / np.abs(voice).max()


# ---------------------------------------------------------------- 合成ユーティリティ（既存と同じ）
def env_adsr(n, a=0.005, d=0.2, s=0.0, r=0.05):
    tt = np.arange(n) / SR
    e = np.where(tt < a, tt / a, s + (1 - s) * np.exp(-(tt - a) / max(d, 1e-4)))
    rel = int(r * SR)
    if rel and n > rel:
        e[-rel:] *= np.linspace(1, 0, rel)
    return e.astype(np.float32)


def tone(freq, dur, harm=(1, 0.5, 0.25), a=0.005, d=0.4, s=0.0, r=0.05, detune=0.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    y = np.zeros(n, np.float32)
    for k, amp in enumerate(harm, 1):
        y += amp * np.sin(2 * np.pi * freq * k * tt * (1 + detune))
    return y * env_adsr(n, a, d, s, r)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def noise(dur):
    return rng.standard_normal(int(dur * SR)).astype(np.float32)


def place(buf, x, sec, gain=1.0):
    i = int(max(0, sec) * SR)
    j = min(len(buf), i + len(x))
    if i < len(buf):
        buf[i:j] += gain * x[: j - i]


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------------------------------------------------------------- BGM（オリジナル・既存と同じ曲調）
BPM = 104
beat = 60 / BPM
bar = beat * 4
CHORDS = [
    (41, [57, 60, 64, 67]),
    (43, [59, 62, 64, 67]),
    (40, [55, 59, 62, 66]),
    (45, [55, 59, 60, 64]),
]
bgm = np.zeros(N, np.float32)
drums = np.zeros(N, np.float32)
kick_t = np.arange(int(0.35 * SR)) / SR
kick = (np.sin(2 * np.pi * (45 * kick_t + 60 * (1 - np.exp(-kick_t * 30)) / 30)) * np.exp(-kick_t * 9)).astype(np.float32)
hat = (np.diff(noise(0.06), prepend=0) * env_adsr(int(0.06 * SR), 0.001, 0.015)).astype(np.float32)
snare_n = noise(0.18)
snare = (lowpass(snare_n, 5000) * env_adsr(len(snare_n), 0.001, 0.06) * 0.6 +
         tone(190, 0.18, harm=(1,), a=0.001, d=0.05) * 0.4).astype(np.float32)

S = {s["id"]: s["from"] / FPS for s in scenes}
# 結論シーンはドラムとアルペジオを抜いて空気を締める
serious_from = S[cfg.get("bgm", {}).get("seriousFrom", "conclusion")]
serious_to = S[cfg.get("bgm", {}).get("seriousTo", "ending")]
nbars = int(np.ceil(total_sec / bar)) + 1
for b in range(nbars):
    t0 = b * bar
    root, notes = CHORDS[b % 4]
    serious = serious_from - 0.2 <= t0 < serious_to - 0.2
    for hit in ((0, 2.5 * beat) if not serious else (0,)):
        for n in notes:
            place(bgm, tone(midi(n), bar * 0.95, harm=(1, 0.35, 0.12, 0.05), a=0.01, d=1.2, s=0.15, r=0.2,
                            detune=0.0015), t0 + hit, 0.07)
    for k, off in enumerate((0, 1.5, 2, 3.5) if not serious else (0, 2)):
        nn = root if k % 2 == 0 else root + 7
        place(bgm, tone(midi(nn), beat * 0.9, harm=(1, 0.3), a=0.005, d=0.35, s=0.2, r=0.05), t0 + off * beat, 0.16)
    if not serious:
        for k in range(8):
            n = notes[(k * 3) % 4] + 12
            place(bgm, tone(midi(n), 0.25, harm=(1, 0.2), a=0.002, d=0.12), t0 + k * beat / 2, 0.035)
    for q in range(4):
        tq = t0 + q * beat
        if q in (0, 2) and (not serious or q == 0):
            place(drums, kick, tq, 0.5)
        if q in (1, 3) and not serious:
            place(drums, snare, tq, 0.18)
        if not serious:
            for h in (0, 0.5):
                place(drums, hat, tq + h * beat, 0.10 if h else 0.06)

bgm = bgm + drums
tt = np.arange(N) / SR
bgm *= np.clip(tt / 0.4, 0, 1) * np.clip((total_sec - tt) / 1.4, 0, 1)

# サイドチェイン・ダッキング（ナレーション中はBGMを約 -7dB）
win = int(0.02 * SR)
venv = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
gate = (venv > 0.01).astype(np.float32)
duck = np.zeros_like(gate)
acc = 0.0
att, rel = np.exp(-1 / (0.03 * SR)), np.exp(-1 / (0.35 * SR))
for i in range(0, N, 32):
    g = gate[i]
    acc = g + (acc - g) * ((att if g > acc else rel) ** 32)
    duck[i:i + 32] = acc
bgm *= 1.0 - 0.55 * duck


# ---------------------------------------------------------------- 効果音（オリジナル・既存と同じ合成）
def whoosh(dur=0.45):
    n = noise(dur)
    e = np.sin(np.linspace(0, np.pi, len(n))) ** 2
    return (lowpass(n, 2200) * e * 0.9).astype(np.float32)


def pop_s(freq=880):
    n = int(0.12 * SR)
    tt_ = np.arange(n) / SR
    fr = freq * (1 + 0.6 * np.exp(-tt_ * 40))
    return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt_ * 28)).astype(np.float32)


def tick():
    return tone(2400, 0.03, harm=(1,), a=0.0005, d=0.008)


def chime(base=72):
    y = np.zeros(int(1.4 * SR), np.float32)
    for k, n in enumerate((base, base + 4, base + 7, base + 12)):
        x = tone(midi(n), 1.2, harm=(1, 0.3, 0.1), a=0.002, d=0.5)
        o = int(k * 0.07 * SR)
        y[o:o + len(x)] += x[: len(y) - o]
    return y / 4


def thud():
    n = int(0.5 * SR)
    tt_ = np.arange(n) / SR
    return (np.sin(2 * np.pi * (70 * tt_ + 80 * (1 - np.exp(-tt_ * 20)) / 20)) * np.exp(-tt_ * 7)).astype(np.float32)


def stamp():
    return (thud() * 0.8 + np.pad(lowpass(noise(0.1), 3000) * env_adsr(int(0.1 * SR), 0.001, 0.03),
                                  (0, int(0.4 * SR)))).astype(np.float32)


def typing(dur=0.6):
    y = np.zeros(int(dur * SR), np.float32)
    k = 0
    while k * 0.07 < dur - 0.03:
        place(y, tone(1500 + 300 * rng.random(), 0.025, harm=(1,), a=0.0005, d=0.006), k * 0.07, 0.6)
        k += 1
    return y


sfx = np.zeros(N, np.float32)
for sid in scene_ids[1:]:
    place(sfx, whoosh(), S[sid] - 0.12, 0.3)
pop_i = 0
for kind, sec, name in sfx_plan:
    if kind == "pop":
        place(sfx, pop_s(700 + (pop_i % 4) * 120), sec, 0.33)
        pop_i += 1
    elif kind == "tick":
        place(sfx, tick(), sec, 0.22)
    elif kind == "stamp":
        place(sfx, stamp(), sec, 0.5)
    elif kind == "impact":
        place(sfx, thud(), sec, 0.6)
    elif kind == "whoosh":
        place(sfx, whoosh(0.35), sec - 0.1, 0.25)
    elif kind == "typing":
        place(sfx, typing(0.8), sec, 0.25)
    elif kind == "chime":
        place(sfx, chime(72), sec, 0.35)

# ---------------------------------------------------------------- ミックス
d = int(0.012 * SR)
L_ch = voice + 0.9 * bgm + sfx
R_ch = voice.copy() + sfx
R_ch[d:] += 0.9 * bgm[:-d]
out = np.stack([L_ch, R_ch], 1)[: int(total_sec * SR)]
out *= 0.79 / np.abs(out).max()
mp = os.path.join(OUT, "master.wav")
with wave.open(mp, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
# ラウドネス正規化（2パス・線形）: -15 LUFS / True Peak -1.5 dBTP
tmp = mp + ".tmp.wav"
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp, "-af", "loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json",
                    "-f", "null", "-"], capture_output=True, text=True)
m = json.loads(re.search(r"\{[^{}]*\}\s*$", r.stderr).group(0))
af = (f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", mp, "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", tmp], check=True)
os.replace(tmp, mp)
pub = os.path.join(ROOT, "public", "articles", SLUG)
os.makedirs(pub, exist_ok=True)
shutil.copy(mp, os.path.join(pub, "master.wav"))
print("loudnorm input", m["input_i"], "LUFS -> -15 target")
print(f"total {total_sec:.2f}s = {total_frames} frames; speech end {speech_end:.2f}s")
print("scenes:", [(s['id'], s['from'], s['duration']) for s in scenes])
print("events:", events)
