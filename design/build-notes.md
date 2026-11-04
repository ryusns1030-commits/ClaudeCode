# うちのこ Canvaカンプ 制作メモ（作業用）

Canva design: DAHZ8urv2dg  edit: https://www.canva.com/d/jWmhG6cyknd8x07  view: https://www.canva.com/d/17-u8XhBkWD1hQB
画面サイズ 390x844（ページ単位）。表紙 p1 は 1080x1920。

## 手順（edit-design）
1. read-design open_transaction → add_page(390x844, bg, title) → read-design design_content page_indices=[n] で page_id 取得
2. 呼び出しA: 図形+テキスト配置（テキストは既定16px黒）
3. 呼び出しB: format_text で文字サイズ・色・揃え
4. commit（ユーザー依頼に基づき保存）

注意: 図形の高さは最低8px → 区切り線は h8 viewBox内に1px矩形 "M0 3.5 H318 V4.5 H0 Z"
注意: 線だけのアイコン（stroke）は描画が崩れる → 塗りアイコンのみ
注意: line_height 上限2.5

## トークン（ライト）
bg #FBF7F0 / surface #FFFFFF / surface2 #F3ECE2 / border #E8DFD2
text #3A322B / text2 #6E6258
primary(あんず) #B8613D / primarySoft #F6E3D8
sage(済・良好) #4F7A5E / soft #E2EEE5
blue(予定・通院) #4F6F8F / soft #E3EAF2
amber(未・注意) #9A6412 / soft #FBEFD9
red(症状・エラー) #B0443A / soft #F8E1DD

## トークン（ダーク）
bg #1E1A17 / surface #2A2521 / surface2 #352F2A / border #433B34
text #F3ECE3 / text2 #C2B6A9
primary #E39A76 / primarySoft #4A3328
sage #8FBF9F soft #2C3A30 / blue #9DB6D1 soft #2C3540 / amber #E2B66A soft #3F3424 / red #E58C80 soft #44291F

## 文字
大見出し 24 bold / 見出し 18 bold / 本文強調 16 bold / 本文 16 / 補足 14 / チップ 14 bold / タブ 12

## レイアウト
左右余白 20（カードは left16 w358 角丸20）/ ステータスバー 9:41(top15 left34) 電波(306,19) 電池(334,19)
タブバー: 背景線 #E8DFD2 top760 h84 → 白 top761 h83 / 選択ピル 56x32 top767 left(中心-28) / アイコン24 top771 / ラベル12 top802 w78
タブ中心 x: 39,117,195,273,351

## アイコン（24 viewBox、塗り）
記録 "M15 3 L21 9 L9 21 H3 V15 Z"
チャート "M3 14 H7 V21 H3 Z M10 8 H14 V21 H10 Z M17 3 H21 V21 H17 Z"
日記 "M3 5 C6 4 9 4 11 6 V21 C9 19 6 19 3 20 Z M13 6 C15 4 18 4 21 5 V20 C18 19 15 19 13 21 Z"
プロフィール(犬) "M12 6 C16 6 19 9 19 13 C19 17 16 20 12 20 C8 20 5 17 5 13 C5 9 8 6 12 6 Z M5 7 C3 7 1 10 1 14 C3 14 5 12 6 9 Z M19 7 C21 7 23 10 23 14 C21 14 19 12 18 9 Z"
カレンダー "M3 5 H21 V21 H3 Z M7 2 H9 V6 H7 Z M15 2 H17 V6 H15 Z" + 白窓 14x9 (left+5, top+10)
症状(ハート) "M12 21 C5 15 2 12 2 8 C2 5 4 3 7 3 C9 3 11 4 12 6 C13 4 15 3 17 3 C20 3 22 5 22 8 C22 12 19 15 12 21 Z"
排泄(しずく) "M12 2 C16 8 19 11 19 15 C19 19 16 22 12 22 C8 22 5 19 5 15 C5 11 8 8 12 2 Z"
食事(器) "M2 10 H22 C22 16 18 21 12 21 C6 21 2 16 2 10 Z M7 3 H9 V8 H7 Z M11 2 H13 V8 H11 Z M15 3 H17 V8 H15 Z"
服薬(カプセル) "M8 3 C11 0 15 1 17 3 C19 5 20 9 17 12 L12 17 C9 20 5 19 3 17 C1 15 0 11 3 8 Z"
円 "M18 0 A18 18 0 1 1 18 36 A18 18 0 1 1 18 0 Z"(36)

## ページ進捗
p1 表紙 / p2 01 記録トップ ✓
p3 PB8lsMb7V9qHr4P6 00 デザインシステム(1200x1500) ✓
p4 PBjVBFVDDb70Dl38 08 チャート血液(ALB/TP) ✓
p5 PBjdGHt1JrNk4vPl 10 日記一覧 ✓
p6 PBMNlMmFl52JN0F2 13 プロフィールトップ ✓
p7 PBZsr1PnwLVMryKR 19 月間カレンダー ✓
p8 PBFLctrJF8HwdqDP 21 未登録 ✓
p9 PBFjtDzVmT7mNxQD 02 症状入力 ✓
p10 PBrfd2qsQypKVGv7 03 服薬記録 ✓
p11 PBD0ZHlLdbmJqDHj 04 薬の登録 ✓
p12 PBm0rlMmvlymxhyj 05 検査一覧 ✓
p13 PBRPrK8b7TyGCjq8 06 検査追加 ✓
p14 PBshcSlD9s1LD7l8 07 自動読取(将来) ✓
p15 PBdTrFqqP4cFz6Y8 08b 電解質のみ ✓
p16 PBHg5kY0XshnqXrM 09 体重など ✓
p17 PBzYc2gWQwzlm96R 11 日記作成 ✓
p18 PBz1rKVbxpFnzpHc 12 日記詳細 ✓
p19 PBHKJrhs6vklbpPZ 14 愛犬登録 ✓
p20 PBHgXpXMMfZ90WgX 15 病院・通院 ✓
p21 PB0G2Nj6bkTGSvsS 16 ☰メニュー ✓
p22 PBrVsFXC0Q0gRTfq 17 設定 ✓
p23 PBNyNjvsp9nk7743 18 ガイド ✓
p24 PBkzxMDlcmfVqlZg 20 日付詳細 ✓
p25 PBRWKJfbYcxDKN1J 22 病院で見せる ✓
p26 PBQ7PZCrhXmRYbTb 23a 空状態 ✓
p27 PB7GpGsHtjBHFKg6 23b 保存完了 ✓
p28 PBLZQYQHYYSclXMj 23c エラー ✓
p29 PB5CClf0hVYnJ8Nd 24a ダーク記録 ✓
p30 PB39fZgR4QVB0TQG 24b ダークチャート ✓

## メモ
- 写真はプレースホルダー（淡色の角丸矩形＋白い犬アイコン）。権利配慮のため実写は未使用
- 各ページ: open_transaction → 呼出A(配置) → 呼出B(format) → commit
- edit-design は page_index のページ全体を返す（約25kトークン）
- カレンダー: 18pt lh2.5 の列テキスト → 行中心 = top+9 +45r（実測）。マーカーは中心+16
- 詳細画面: 入力フォーム=モーダル（キャンセル/タイトル/保存、タブバーなし）、閲覧系push=「‹ 戻る」+タブバーあり

## 生成スクリプト
- gen/lib.py（部品）, gen/pNN.py → pNN.ops.json, gen/fmt.py pNN（直近のCanva応答から format 操作生成）, gen/clone.py（既存ページ複製・ダーク変換）
