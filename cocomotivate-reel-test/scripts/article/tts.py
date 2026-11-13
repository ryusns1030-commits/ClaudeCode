"""記事フォルダの planning/script.json から、VOICEVOX でナレーションを1行ずつ合成する。

使い方:  .venv/bin/python scripts/article/tts.py articles/<slug>
出力:    articles/<slug>/build/voice/NN.wav, meta.json（長さ・モーラ単位タイミング・kana・子音/母音長）
         expectKana と audio_query の kana を照合し、合わなければ警告する。

既存の scripts/tts.py（初回リール用）は変更せず、同じ合成方式をそのまま使う。
"""
import json
import os
import sys
import urllib.parse
import urllib.request
import wave

ENGINE = os.environ.get("VOICEVOX_URL", "http://localhost:50021")


def post(path, params=None, body=None):
    url = f"{ENGINE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    data = json.dumps(body).encode() if body is not None else b""
    req = urllib.request.Request(url, data=data, method="POST", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def mora_timeline(q, speed):
    """audio_query から [母音開始, 終了, 母音, 子音長, 母音長, モーラ文字] を作る（speedScale 反映後の秒）。"""
    t = q["prePhonemeLength"]
    out = []
    for ap in q["accent_phrases"]:
        for m in ap["moras"]:
            c = m.get("consonant_length") or 0.0
            v = m["vowel_length"]
            start = t + c  # 口が開くのは母音部
            t += c + v
            out.append([start / speed, t / speed, m["vowel"], c / speed, v / speed, m["text"]])
        pm = ap.get("pause_mora")
        if pm:
            t += pm["vowel_length"]
    return out


def norm(k):
    """kana 照合用：アクセント記号を除き、長音・ウ/オ長音の表記ゆれを吸収する。"""
    k = k.replace("'", "").replace("/", "").replace("_", "").replace("、", "")
    return k.replace("ー", "").replace("ウ", "オ").replace("イ", "エ")


def main():
    art = os.path.abspath(sys.argv[1])
    cfg = json.load(open(os.path.join(art, "planning", "script.json"), encoding="utf-8"))
    out = os.path.join(art, "build", "voice")
    os.makedirs(out, exist_ok=True)
    meta, warn = [], []
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
            path = os.path.join(out, f"{idx:02d}.wav")
            open(path, "wb").write(wav)
            with wave.open(path) as w:
                dur = w.getnframes() / w.getframerate()
            moras = mora_timeline(q, cfg["speedScale"])
            mora_text = "".join(m[5] for m in moras)
            for ek in line.get("expectKana", []):
                if norm(ek) not in norm(mora_text):
                    warn.append(f"{line['id']}: 期待した読み「{ek}」が見つからない → {q['kana']}")
            meta.append({
                "index": idx, "id": line["id"], "scene": scene["id"], "sub": line["sub"], "tts": line["tts"],
                "kana": q["kana"], "moraText": mora_text, "duration": dur, "moras": moras,
                "speechSec": sum(m[3] + m[4] for m in moras),
                "moraCount": len(moras),
            })
            print(f"{line['id']} {dur:5.2f}s  {len(moras):3d}mora  {q['kana']}", file=sys.stderr)
            idx += 1
    json.dump(meta, open(os.path.join(out, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    total = sum(m["duration"] for m in meta)
    rate = sum(m["moraCount"] for m in meta) / sum(m["speechSec"] for m in meta)
    print(f"total speech {total:.2f}s / {rate:.2f} mora/s (excluding pauses)", file=sys.stderr)
    for w_ in warn:
        print("WARN", w_, file=sys.stderr)


if __name__ == "__main__":
    main()
