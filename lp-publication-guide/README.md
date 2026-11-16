# はじめてでもできる！LP公開ガイド（購入者向け無料特典）

結婚相談所向けLPテンプレートの購入者に配布する、LP公開マニュアル一式です。

## 成果物
| ファイル | 内容 |
|---|---|
| `pdf/LP_Upload_Guide_ConoHa.pdf` | はじめてでもできる！LP公開ガイド｜ConoHa WING編（22ページ） |
| `pdf/LP_Upload_Guide_Xserver.pdf` | はじめてでもできる！LP公開ガイド｜エックスサーバー編（21ページ） |
| `pdf/LP_Upload_Troubleshooting.pdf` | ホームページが表示されないときの確認ガイド（6ページ） |
| `docs/Canva_Manuscript_*.md` | Canvaに移すためのページ別原稿＋図解・配置指示 |
| `docs/Official_Sources.md` | 公式情報の参照元一覧（調査日：2026年11月16日） |
| `docs/Update_Watchlist.md` | 更新が必要になりやすい箇所・未確認事項 |
| `docs/QA_Report.md` | 品質チェック結果 |

## 編集・再生成
原稿は `src/`（HTML）です。共通ページは `src/partials/`、サーバーごとの差分は各HTML先頭の `guide-vars` で管理しています。

```bash
# 初回のみ：フォント（Noto Sans JP, SIL OFL）を用意
npm pack @fontsource/noto-sans-jp@5.1.1 && tar xzf fontsource-noto-sans-jp-5.1.1.tgz
mkdir -p fonts/files && cp package/{400,700,900}.css fonts/ && cp package/files/*-{400,700,900}-normal.woff2 fonts/files/
# PDF生成（Playwright + Chromium）
node build.js            # すべて
node build.js xserver    # 1冊だけ
node export_manuscript.js  # Canva用原稿を再出力
```
