"""VOICEVOX Engine (localhost:50021) でナレーションを1行ずつ合成する。

出力:
  build/voice/NN.wav        各行の音声
  build/voice/meta.json     各行の長さ・モーラ(母音)タイミング・読み(kana)
"""
import json
import os
import sys
import urllib.parse
import urllib.request
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE = os.environ.get("VOICEVOX_URL", "http://localhost:50021")
OUT = os.path.join(ROOT, "build", "voice")


def post(path, params=None, body=None):
    url = f"{ENGINE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    data = json.dumps(body).encode() if body is not None else b""
    req = urllib.request.Request(url, data=data, method="POST",
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def mora_timeline(q, speed):
    """audio_query から (start, end, vowel) のリストを作る（speedScale 反映後の秒）。"""
    t = q["prePhonemeLength"]
    out = []
    for ap in q["accent_phrases"]:
        for m in ap["moras"]:
            c = m.get("consonant_length") or 0.0
            v = m["vowel_length"]
            start = t + c  # 口が開くのは母音部
            t += c + v
            out.append([start / speed, t / speed, m["vowel"]])
        pm = ap.get("pause_mora")
        if pm:
            t += pm["vowel_length"]
    return out


def main():
    cfg = json.load(open(os.path.join(ROOT, "scripts", "script.json"), encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    meta = []
    idx = 0
    for scene in cfg["scenes"]:
        for line in scene["lines"]:
            q = json.loads(post("/audio_query", {"text": line["tts"], "speaker": cfg["speaker"]}))
            q["speedScale"] = cfg["speedScale"]
            q["pitchScale"] = cfg["pitchScale"]
            q["intonationScale"] = cfg["intonationScale"]
            q["volumeScale"] = cfg["volumeScale"]
            q["prePhonemeLength"] = 0.05
            q["postPhonemeLength"] = 0.08
            q["outputSamplingRate"] = 48000
            q["outputStereo"] = False
            wav = post("/synthesis", {"speaker": cfg["speaker"]}, q)
            path = os.path.join(OUT, f"{idx:02d}.wav")
            open(path, "wb").write(wav)
            with wave.open(path) as w:
                dur = w.getnframes() / w.getframerate()
            meta.append({
                "index": idx, "scene": scene["id"], "sub": line["sub"], "tts": line["tts"],
                "kana": q["kana"], "duration": dur,
                "moras": mora_timeline(q, cfg["speedScale"]),
            })
            print(f"{idx:02d} {dur:5.2f}s  {q['kana']}", file=sys.stderr)
            idx += 1
    json.dump(meta, open(os.path.join(OUT, "meta.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    total = sum(m["duration"] for m in meta)
    print(f"total speech {total:.2f}s", file=sys.stderr)


if __name__ == "__main__":
    main()
