# -*- coding: utf-8 -*-
"""台本からセリフ音声・タイムライン・BGM/SEを生成し、ミックスする。"""
import json, os, subprocess, wave, hashlib
import numpy as np
import pyopenjtalk
from script import SCENES, READ_SUBS

SR = 48000
FPS = 30
OUT = os.path.join(os.path.dirname(__file__), "build")
VOX = os.path.join(OUT, "vox")
os.makedirs(VOX, exist_ok=True)

LINE_GAP = 0.32      # セリフ間
SCENE_IN = 0.75      # シーン頭の間
SCENE_OUT = 0.45     # シーン終わりの間


def reading(text, r=None):
    s = r if r else text
    for a, b in READ_SUBS:
        s = s.replace(a, b)
    return s


def wav_write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def wav_read(path):
    with wave.open(path, "rb") as w:
        assert w.getframerate() == SR
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32767


def synth(speaker, text):
    key = hashlib.md5((speaker + text).encode()).hexdigest()[:12]
    path = os.path.join(VOX, f"{speaker}_{key}.wav")
    if os.path.exists(path):
        return wav_read(path)
    if speaker == "H":     # 新人：明るく少し速め
        x, sr = pyopenjtalk.tts(text, speed=1.07, half_tone=1.5)
    else:                  # ベテラン：落ち着いた低めの声
        x, sr = pyopenjtalk.tts(text, speed=1.02, half_tone=-7.0)
    assert sr == SR
    x = x / 32768.0
    raw = path + ".raw.wav"
    wav_write(raw, x / max(1e-6, np.abs(x).max()) * 0.9)
    if speaker == "K":
        # フォルマントごと下げて男性寄りの声質に
        k = 0.76
        af = f"asetrate={int(SR*k)},aresample={SR},atempo={1/k:.4f},equalizer=f=180:t=q:w=1:g=3"
    else:
        af = "equalizer=f=3500:t=q:w=1:g=2"
    af += ",silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-17:TP=-2:LRA=7"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", af, "-ar", str(SR), "-ac", "1", path], check=True)
    os.remove(raw)
    return wav_read(path)


def envelope(x, start):
    """フレームごとの口の開き（0..9）。動画フレーム境界に合わせる。"""
    hop = SR // FPS
    n = int(np.ceil(len(x) / hop))
    rms = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop] ** 2) + 1e-12) for i in range(n)])
    ref = np.percentile(rms, 90) + 1e-9
    v = np.clip(rms / ref, 0, 1)
    v = np.where(v < 0.12, 0, v)
    return "".join(str(int(round(a * 9))) for a in v)


def main():
    t = 1.0
    timeline = dict(fps=FPS, scenes=[])
    clips = []
    for si, sc in enumerate(SCENES):
        s_start = t
        t += SCENE_IN if si else 0.6
        lines = []
        for spk, text, opt in sc["lines"]:
            x = synth(spk, reading(text, opt.get("r")))
            dur = len(x) / SR
            lines.append(dict(s=spk, text=text, start=round(t, 3), dur=round(dur, 3),
                              e=opt.get("e", ""), show=opt.get("show"), env=envelope(x, t)))
            clips.append((t, x))
            t += dur + LINE_GAP
        t += SCENE_OUT
        if sc["type"] == "ending":
            t += 2.5
        timeline["scenes"].append(dict(id=sc["id"], type=sc["type"], chapter=sc["chapter"], data=sc["data"],
                                       start=round(s_start, 3), end=round(t, 3), lines=lines))
        print(f"{sc['id']:10s} {s_start:7.2f} - {t:7.2f}")
    total = t + 0.5
    timeline["duration"] = round(total, 3)

    # ---- voice track
    N = int(total * SR) + SR
    voice = np.zeros(N)
    speaking = np.zeros(N)
    for st, x in clips:
        i = int(st * SR)
        voice[i:i + len(x)] += x
        speaking[i:i + len(x)] = 1

    # ---- BGM（やわらかいエレピ風のコード進行をその場で合成）
    bgm = make_bgm(N)
    # ダッキング：セリフ中は BGM を下げる
    k = int(0.25 * SR)
    duck = np.convolve(speaking, np.ones(k) / k, mode="same")
    g = 0.20 - 0.11 * np.clip(duck, 0, 1)
    fade = np.ones(N)
    fi = int(1.5 * SR); fade[:fi] = np.linspace(0, 1, fi)
    fo = int(3.0 * SR); end = int(total * SR); fade[end - fo:end] = np.linspace(1, 0, fo); fade[end:] = 0
    bgm = bgm * g * fade

    # ---- SE：シーン切替のスウッシュ、要素表示のポップ
    se = np.zeros(N)
    rng = np.random.default_rng(1)
    for sc in timeline["scenes"][1:]:
        i = int(sc["start"] * SR)
        L = int(0.45 * SR)
        noise = rng.standard_normal(L)
        noise = np.convolve(noise, np.ones(12) / 12, mode="same")
        envw = np.sin(np.linspace(0, np.pi, L)) ** 2
        se[i:i + L] += noise * envw * 0.10
    pop_times = reveal_times(timeline)
    for pt in pop_times:
        i = int(pt * SR)
        L = int(0.09 * SR)
        tt = np.arange(L) / SR
        f = 1100 + 900 * np.exp(-tt * 40)
        ph = 2 * np.pi * np.cumsum(f) / SR
        se[i:i + L] += np.sin(ph) * np.exp(-tt * 45) * 0.07

    mix = voice * 0.95 + bgm + se
    mix = mix[:int(total * SR)]
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
    stereo = np.stack([mix, mix], 1)
    with wave.open(os.path.join(OUT, "mix.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())
    with open(os.path.join(OUT, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False)
    print("total", round(total, 2), "sec")


def reveal_times(tl):
    """show が増えるタイミング（盤面の要素が出る瞬間）"""
    out = []
    for sc in tl["scenes"]:
        cur = 0
        for ln in sc["lines"]:
            if ln["show"] is not None and ln["show"] > cur:
                n = ln["show"] - cur
                for j in range(n):
                    out.append(ln["start"] + j * 0.35)
                cur = ln["show"]
    return out


def make_bgm(N):
    bpm = 84
    beat = 60 / bpm
    # C - Am - F - G（ゆったり）
    prog = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]
    bass = [36, 33, 29, 31]
    out = np.zeros(N)
    bar = 4 * beat
    t0 = 0.0
    bi = 0

    def tone(freq, dur, amp, decay):
        L = int(dur * SR)
        tt = np.arange(L) / SR
        w = (np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(4 * np.pi * freq * tt) + 0.1 * np.sin(6 * np.pi * freq * tt))
        env = np.exp(-tt * decay) * np.minimum(1, tt / 0.01)
        return w * env * amp

    arp = [0, 2, 1, 3, 2, 1, 3, 2]
    while int(t0 * SR) < N:
        chord = prog[bi % 4]
        # パッド的な和音
        for n in chord:
            f = 440 * 2 ** ((n - 69) / 12)
            x = tone(f, bar + 0.6, 0.08, 1.1)
            i = int(t0 * SR); out[i:i + len(x)] += x[:max(0, N - i)]
        # アルペジオ（8分）
        for k, idx in enumerate(arp):
            n = chord[idx] + 12
            f = 440 * 2 ** ((n - 69) / 12)
            x = tone(f, beat * 1.5, 0.05, 4.5)
            i = int((t0 + k * beat / 2) * SR); out[i:i + len(x)] += x[:max(0, N - i)]
        # ベース
        for k in (0, 2):
            f = 440 * 2 ** ((bass[bi % 4] - 69) / 12)
            x = tone(f, beat * 1.8, 0.16, 2.0)
            i = int((t0 + k * beat) * SR); out[i:i + len(x)] += x[:max(0, N - i)]
        t0 += bar
        bi += 1
    # 軽くローパス
    out = np.convolve(out, np.ones(6) / 6, mode="same")
    return out / (np.abs(out).max() + 1e-9)


if __name__ == "__main__":
    main()
