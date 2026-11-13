# ChatGPT×Instagram運用 解説動画（YouTube横動画 1920x1080）

新人「ハル」とベテラン「クロダ」の掛け合いで、ChatGPTを使ったInstagram運用の仕組み化（7ステップ）を解説するアニメーション動画を、台本から自動生成します。

## 構成
- `script.py` … 台本（セリフ・表情・盤面の表示タイミング・図解データ）
- `build_audio.py` … Open JTalk（pyopenjtalk）で音声合成、口パク用の音量包絡、BGM/効果音を生成してミックス
- `index.html` / `anim.js` … 時刻 t を指定するとそのフレームを描く決定論的アニメーション（SVGキャラ・図解・字幕）
- `render.js` … Playwright でフレームを書き出し、ffmpeg で MP4 に（`preview` でも確認可能）
- `thumb.js` … サムネイル生成

## 作り方
```
pip install pyopenjtalk-plus numpy
npm install
python3 build_audio.py
node render.js preview 30 120      # 静止画で確認
node render.js video 4             # output/instagram_chatgpt_manual.mp4
node thumb.js
```
台本を直したら `build_audio.py` から再実行するだけで動画全体が作り直されます。

## クレジット
- 音声：HTS Voice "Mei"（© Nagoya Institute of Technology, MMDAgent Project / CC BY 3.0）
- フォント：M PLUS Rounded 1c（SIL OFL）
