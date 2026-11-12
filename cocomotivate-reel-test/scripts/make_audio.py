"""ナレーションを並べてタイムラインを作り、オリジナルBGM・効果音を合成してミックスする。

入力:  build/voice/*.wav, build/voice/meta.json, scripts/script.json
出力:  public/audio/master.wav   最終ミックス（48kHz stereo）
       src/timeline.json         シーン/字幕/演出キュー/口パク（すべてフレーム単位）
BGM・効果音はすべて numpy による手続き的合成（外部素材なし＝権利上クリーン）。
"""
import json
import os
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
FPS = 30
rng = np.random.default_rng(7)

cfg = json.load(open(os.path.join(ROOT, "scripts", "script.json"), encoding="utf-8"))
meta = json.load(open(os.path.join(ROOT, "build", "voice", "meta.json"), encoding="utf-8"))


def read_wav(p):
    with wave.open(p) as w:
        assert w.getframerate() == SR, w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(1)
    return x


# ---------------------------------------------------------------- タイムライン
SMALL = set("ャュョァィゥェォヮ")


def kana_moras(kana):
    s = [c for c in kana if c not in "'/_、"]
    out = []
    for c in s:
        if c in SMALL and out:
            out[-1] += c
        else:
            out.append(c)
    return out


# 演出キュー: (イベント名, 行番号, 読みのキーワード, 何番目の出現か(-1=最後))
CUES = [
    ("followersCount", 0, "サンゼン", 0),
    ("viewsLabel", 1, "ストオリイズ", 0),
    ("viewsReveal", 2, "ニジュウダイ", 0),
    ("sheets", 3, "イチマイ", 0),
    ("timeRandom", 4, "トオコオジカン", 0),
    ("skipDays", 4, "シナイ", 0),
    ("reelSplit", 5, "リイル", 0),
    ("chatOpen", 6, "チャット", 0),
    ("chip1", 7, "スウジ", 0),
    ("chip2", 7, "トオコオジョオキョオ", 0),
    ("chip3", 7, "ウンヨオモクテキ", 0),
    ("ideaWeek", 8, "ヨオビ", 0),
    ("idea1", 9, "ニタク", 0),
    ("idea2", 9, "ヤクダツ", 0),
    ("idea3", 9, "シツモン", 0),
    ("thought", 10, "カイゼンサク", 0),
    ("notConfirmed", 11, "カクニン", -1),
    ("tool", 12, "ドオグ", 0),
    ("verify", 13, "ケンショオ", 0),
    ("final1", 14, "カンガエ", 0),
    ("final2", 14, "タシカメル", 0),
]

HOLD = {s["id"]: s.get("holdAfterSec", 0.0) for s in cfg["scenes"]}
lines = []
t = cfg["leadInSec"]
prev_scene = None
scene_first = {}
for m in meta:
    if prev_scene is not None:
        if m["scene"] != prev_scene:
            t += cfg["sceneGapSec"] + HOLD.get(prev_scene, 0.0)
        else:
            t += cfg["gapSec"]
    moras = kana_moras(m["kana"])
    assert len(moras) == len(m["moras"]), (m["index"], len(moras), len(m["moras"]), moras)
    lines.append({**m, "start": t, "end": t + m["duration"], "kanaMoras": moras})
    scene_first.setdefault(m["scene"], t)
    prev_scene = m["scene"]
    t += m["duration"]
total_sec = t + cfg["tailSec"]
total_frames = int(np.ceil(total_sec * FPS))


def f(sec):
    return int(round(sec * FPS))


events = {}
for name, li, kw, occ in CUES:
    L = lines[li]
    joined = "".join(L["kanaMoras"])
    pos = joined.find(kw) if occ == 0 else joined.rfind(kw)
    assert pos >= 0, (name, kw, joined)
    # 文字位置 -> モーラ番号
    acc, mi = 0, 0
    for i, mo in enumerate(L["kanaMoras"]):
        if acc >= pos:
            mi = i
            break
        acc += len(mo)
    events[name] = f(L["start"] + L["moras"][mi][0])

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
    for (s, e, v) in L["moras"]:
        a, b = L["start"] + s, L["start"] + e
        fa, fb = int(np.floor(a * FPS)), int(np.ceil(b * FPS))
        for fr in range(fa, min(fb, total_frames)):
            # フレーム中心が区間に入るか、区間が短くても最低1フレーム
            c = (fr + 0.5) / FPS
            if a <= c < b or fb - fa <= 1:
                mouth[fr] = VOW.get(v, "-")

timeline = {
    "fps": FPS,
    "durationInFrames": total_frames,
    "scenes": scenes,
    "subtitles": [{"text": L["sub"], "from": f(L["start"]), "to": f(L["end"]), "scene": L["scene"]}
                  for L in lines],
    "events": events,
    "mouth": "".join(mouth),
    "voice": {"engine": "VOICEVOX", "speaker": cfg["speakerName"]},
}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w", encoding="utf-8"),
          ensure_ascii=False)

# ---------------------------------------------------------------- ナレーション
N = int(total_sec * SR) + SR
voice = np.zeros(N, np.float32)
for L in lines:
    x = read_wav(os.path.join(ROOT, "build", "voice", f"{L['index']:02d}.wav"))
    i = int(L["start"] * SR)
    voice[i:i + len(x)] += x
peak = np.abs(voice).max()
voice *= 0.89 / peak  # ≒ -1 dBFS ピーク


# ---------------------------------------------------------------- 合成ユーティリティ
def env_adsr(n, a=0.005, d=0.2, s=0.0, r=0.05):
    t = np.arange(n) / SR
    e = np.where(t < a, t / a, s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = int(r * SR)
    if rel and n > rel:
        e[-rel:] *= np.linspace(1, 0, rel)
    return e.astype(np.float32)


def tone(freq, dur, harm=(1, 0.5, 0.25), a=0.005, d=0.4, s=0.0, r=0.05, detune=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n, np.float32)
    for k, amp in enumerate(harm, 1):
        y += amp * np.sin(2 * np.pi * freq * k * t * (1 + detune))
    return y * env_adsr(n, a, d, s, r)


def lowpass(x, cutoff):
    # 1極ローパス（ベクトル化のため簡易IIRをフレーム分割せずに実装）
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
    i = int(sec * SR)
    j = min(len(buf), i + len(x))
    if i < len(buf):
        buf[i:j] += gain * x[: j - i]


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------------------------------------------------------------- BGM（オリジナル）
BPM = 104
beat = 60 / BPM
bar = beat * 4
# Fmaj9 - G6 - Em7 - Am9 （明るく前向き、軽いローファイ）
CHORDS = [
    (41, [57, 60, 64, 67]),  # F  : A C E G
    (43, [59, 62, 64, 67]),  # G6 : B D E G
    (40, [55, 59, 62, 66]),  # Em7(9th風): G B D F#
    (45, [55, 59, 60, 64]),  # Am9: G B C E
]
bgm = np.zeros(N, np.float32)
drums = np.zeros(N, np.float32)
kick = tone(55, 0.35, harm=(1,), a=0.001, d=0.12) * np.exp(-np.arange(int(0.35 * SR)) / SR * 6)
kick_t = np.arange(len(kick)) / SR
kick = (np.sin(2 * np.pi * (45 * kick_t + 60 * (1 - np.exp(-kick_t * 30)) / 30)) *
        np.exp(-kick_t * 9)).astype(np.float32)
hat = (np.diff(noise(0.06), prepend=0) * env_adsr(int(0.06 * SR), 0.001, 0.015)).astype(np.float32)
snare_n = noise(0.18)
snare = (lowpass(snare_n, 5000) * env_adsr(len(snare_n), 0.001, 0.06) * 0.6 +
         tone(190, 0.18, harm=(1,), a=0.001, d=0.05) * 0.4).astype(np.float32)

nbars = int(np.ceil(total_sec / bar)) + 1
truth_from = next(s for s in scenes if s["id"] == "truth")["from"] / FPS
ending_from = next(s for s in scenes if s["id"] == "ending")["from"] / FPS
for b in range(nbars):
    t0 = b * bar
    root, notes = CHORDS[b % 4]
    serious = truth_from - 0.2 <= t0 < ending_from - 0.2
    # パッド（エレピ風）: 1小節を2回打鍵
    for hit in (0, 2.5 * beat) if not serious else (0,):
        for n in notes:
            place(bgm, tone(midi(n), bar * 0.95, harm=(1, 0.35, 0.12, 0.05), a=0.01, d=1.2, s=0.15, r=0.2,
                            detune=0.0015), t0 + hit, 0.07)
    # ベース
    for k, off in enumerate((0, 1.5, 2, 3.5) if not serious else (0, 2)):
        nn = root if k % 2 == 0 else root + 7
        place(bgm, tone(midi(nn - 12 + 12), beat * 0.9, harm=(1, 0.3), a=0.005, d=0.35, s=0.2, r=0.05),
              t0 + off * beat, 0.16)
    # アルペジオ（明るいキラキラ）
    if not serious:
        for k in range(8):
            n = notes[(k * 3) % 4] + 12
            place(bgm, tone(midi(n), 0.25, harm=(1, 0.2), a=0.002, d=0.12), t0 + k * beat / 2, 0.035)
    # ドラム
    for q in range(4):
        tq = t0 + q * beat
        if q in (0, 2) and (not serious or q == 0):
            place(drums, kick, tq, 0.5)
        if q in (1, 3) and not serious:
            place(drums, snare, tq, 0.18)
        for h in (0, 0.5):
            place(drums, hat, tq + h * beat, 0.10 if h else 0.06)

bgm = bgm + drums
# イントロのフェードインとアウトロのフェードアウト
tt = np.arange(N) / SR
bgm *= np.clip(tt / 0.4, 0, 1) * np.clip((total_sec - tt) / 1.6, 0, 1)

# サイドチェイン・ダッキング（ナレーション中はBGMを下げる）
win = int(0.02 * SR)
venv = np.sqrt(np.convolve(voice ** 2, np.ones(win) / win, mode="same"))
gate = (venv > 0.01).astype(np.float32)
# アタック速め・リリースゆっくり
duck = np.zeros_like(gate)
acc = 0.0
att, rel = np.exp(-1 / (0.03 * SR)), np.exp(-1 / (0.35 * SR))
for i in range(0, N, 32):  # 32サンプル単位で処理して高速化
    g = gate[i]
    acc = g + (acc - g) * ((att if g > acc else rel) ** 32)
    duck[i:i + 32] = acc
bgm_gain = 1.0 - 0.55 * duck
bgm *= bgm_gain

# ---------------------------------------------------------------- 効果音（オリジナル）
sfx = np.zeros(N, np.float32)


def whoosh(dur=0.45):
    n = noise(dur)
    e = np.sin(np.linspace(0, np.pi, len(n))) ** 2
    return (lowpass(n, 2200) * e * 0.9).astype(np.float32)


def pop(freq=880):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    fr = freq * (1 + 0.6 * np.exp(-t * 40))
    return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 28)).astype(np.float32)


def tick():
    return tone(2400, 0.03, harm=(1,), a=0.0005, d=0.008)


def chime(base=72):
    y = np.zeros(int(1.4 * SR), np.float32)
    for k, n in enumerate((base, base + 4, base + 7, base + 12)):
        x = tone(midi(n), 1.2, harm=(1, 0.3, 0.1), a=0.002, d=0.5)
        y[int(k * 0.07 * SR):int(k * 0.07 * SR) + len(x)] += x[: len(y) - int(k * 0.07 * SR)]
    return y / 4


def thud():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (70 * t + 80 * (1 - np.exp(-t * 20)) / 20)) * np.exp(-t * 7)).astype(np.float32)


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


E = {k: v / FPS for k, v in events.items()}
S = {s["id"]: s["from"] / FPS for s in scenes}
for sid in ["problem", "consult", "ideas", "truth", "ending"]:
    place(sfx, whoosh(), S[sid] - 0.12, 0.35)
place(sfx, pop(660), 0.15, 0.35)
# カウントアップのティック（0.9秒間）
for k in range(14):
    place(sfx, tick(), E["followersCount"] + k * 0.065, 0.18)
place(sfx, pop(990), E["followersCount"] + 0.95, 0.4)
place(sfx, thud(), E["viewsReveal"], 0.55)
for k in ("sheets", "timeRandom", "skipDays", "reelSplit"):
    place(sfx, pop(780), E[k], 0.3)
place(sfx, typing(0.7), E["chatOpen"] + 0.1, 0.25)
for i, k in enumerate(("chip1", "chip2", "chip3")):
    place(sfx, pop(700 + i * 160), E[k], 0.35)
for i, k in enumerate(("ideaWeek", "idea1", "idea2", "idea3")):
    place(sfx, pop(620 + i * 120), E[k], 0.35)
place(sfx, pop(880), E["thought"], 0.35)
place(sfx, stamp(), E["notConfirmed"], 0.6)
place(sfx, pop(740), E["tool"], 0.3)
place(sfx, pop(900), E["verify"], 0.3)
place(sfx, chime(72), E["final2"] + 0.2, 0.45)

# ---------------------------------------------------------------- ミックス
mix_mono_voice = voice
L_ch = mix_mono_voice + 0.9 * bgm + sfx
R_ch = mix_mono_voice + 0.9 * bgm + sfx
# BGMアルペジオ等にわずかなステレオ感（Haas的な遅延）
d = int(0.012 * SR)
R_ch[d:] = mix_mono_voice[d:] + 0.9 * np.concatenate([bgm[:-d]])[: len(R_ch) - d] + sfx[d:]
out = np.stack([L_ch, R_ch], 1)[: int(total_sec * SR)]
# AACエンコード後のトゥルーピークを考慮し、サンプルピークを -2 dBFS に揃える
pk = np.abs(out).max()
out *= 0.79 / pk
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
with wave.open(os.path.join(ROOT, "public", "audio", "master.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print(f"total {total_sec:.2f}s = {total_frames} frames; scenes:",
      [(s['id'], s['from'], s['duration']) for s in scenes])
print("events:", events)
