"""timeline.json（実測）と planning/script.json から、実測タイミング入りの deliverables/script.md を作る。
使い方: python3 scripts/article/make_script_md.py articles/<slug>
"""
import json
import sys

A = sys.argv[1]
s = json.load(open(f"{A}/planning/script.json", encoding="utf-8"))
t = json.load(open(f"{A}/deliverables/timeline.json", encoding="utf-8"))
fps = t["fps"]
lab = {x["id"]: x["label"] for x in s["scenes"]}
tts = {l["id"]: l["tts"] for x in s["scenes"] for l in x["lines"]}
kana = {l["id"]: l["kana"] for l in t["lines"]}
rows = "\n".join(
    f"| {u['from']/fps:5.2f}–{u['to']/fps:5.2f} | {u['id']} | {lab[u['scene']]} | {u['text']} | {tts[u['id']]} | `{kana[u['id']]}` |"
    for u in t["subtitles"])
sc = "\n".join(f"| {lab[x['id']]} | {x['from']} | {x['from']/fps:.2f} | {x['duration']/fps:.2f} |" for x in t["scenes"])
ev = "\n".join(f"| {k} | {v} | {v/fps:.2f} |" for k, v in t["events"].items())
scr = "\n".join(f"| {o['scene']} | {o['text']} |" for o in s["onScreenText"])
rev = s.get("revision", {})
md = f"""# 完成台本（{rev.get('version', '')}／実測値）

- 原作：note「{s['article']['title']}」
- 型：A 悩み解決型／CTA：保存
- ナレーション：VOICEVOX:春日部つむぎ（ノーマル）／speedScale {s['speedScale']}・intonationScale {s['intonationScale']}・48kHz
- **動画尺（実測）：{t['durationInFrames']}フレーム ＝ {t['durationInFrames']/fps:.2f}秒**（発話終了 {t['speechEndFrame']/fps:.2f}秒）
- 最新の改訂：{rev.get('reason', '')}

## 改訂履歴
| 版 | 内容 |
|---|---|
| v2（第1段階） | 推定43.5秒の台本 |
| v3（第2段階） | 実測で約47.0秒になったため、L06の読み上げを削除して画面ラベル化し、L04を短縮。L02・L07の字幕に改行位置を指定 |
| v4（第3段階） | 5項目チェックの表示時間を約1.2秒から約3.5秒に延長。ヒントをCTAと重複しない内容（英語に詳しい人にも確認）に差し替え。実体験の場面に「英訳中…」の表示を追加 |

## 台本（実測タイミング）
| 時刻(秒) | 行 | シーン | 字幕テキスト | 読み上げテキスト | VOICEVOX の読み(kana) |
|---|---|---|---|---|---|
{rows}

## 画面テキスト
| シーン | テキスト |
|---|---|
{scr}

## シーン（実測）
| シーン | 開始フレーム | 開始(秒) | 長さ(秒) |
|---|---|---|---|
{sc}

## 演出キュー（発話の瞬間のフレーム）
| キュー | フレーム | 秒 |
|---|---|---|
{ev}

## クレジット
VOICEVOX:春日部つむぎ（動画のエンディングと各投稿文に記載）
"""
open(f"{A}/deliverables/script.md", "w", encoding="utf-8").write(md)
print("ok", t["durationInFrames"] / fps)
