# 更新が必要になりやすい箇所の一覧

公式サイトの画面・手順は予告なく変わります。**半年に1回程度**、または購入者から「画面が違う」と連絡があったときに、以下を公式ページと照合してください。修正は `src/` のHTMLを直し、`node build.js` でPDFを再生成します。

| 優先 | 箇所（ファイル） | 内容 | 確認先 |
|---|---|---|---|
| 高 | conoha.html STEP 5〜9・11 | 「WING」「サイト管理」「ファイルマネージャー」「ファイルアップロード」「ファイルを選択」「フォルダを選択」のメニュー名・位置 | support.conoha.jp/w/filemanager/ |
| 高 | xserver.html STEP 5〜8・10 | 「ご契約一覧 > サーバー」「ファイル管理」、ファイルマネージャのボタン名（新規フォルダ／アップロード／展開） | xserver.ne.jp/manual/man_tool_file.php |
| 高 | xserver.html 全体 | 「新サーバーパネル／旧サーバーパネル」の2系統。旧パネル廃止・名称変更の可能性 | man_domain_setting.php ほか |
| 高 | 各ログインURL | XServerアカウント／サーバーパネル／ファイルマネージャのURL（secure.xserver.ne.jp/xapanel/...） | man_tool_xserver.php／man_tool_server.php |
| 中 | conoha.html STEP 3・4 | 「+ドメイン」「新規ドメインを追加」、SSL「サイトセキュリティ」→「SSL」→「利用設定」 | w/adddomain/、w/letsencrypt/ |
| 中 | xserver.html STEP 3・4 | 「ドメインを追加」「追加する」、「SSL設定」ON、反映時間（最大24時間／最大1時間） | man_domain_setting.php、man_server_ssl.php |
| 中 | conoha.html STEP 1・2 | 申込手順（料金タイプ・追加ツール名など）。AIツール等の追加項目は頻繁に変わる | support.conoha.jp/c/easysetup/ |
| 中 | 反映時間の記載 | ConoHaネームサーバー 24〜72時間、Xserver ドメイン24時間・SSL1時間・無効なURL 30分〜1時間 | 各公式 |
| 中 | troubleshooting.html No.9 | ConoHaコンテンツキャッシュの場所・初期値、Xserverサーバーキャッシュ時間 | w/contentscache/、man_server_cache.php |
| 低 | zip.html | Windowsの右クリックメニュー名（すべて展開／すべて抽出）、Mac解凍方法 | Microsoft／Apple サポート |
| 低 | closing.html | 公開代行の料金（3,300円／8,800円） | 社内の料金表 |
| 低 | 各PDFの「調査日」 | `guide-vars` の `DATE`、表紙・参照元ページ | — |

## 本書で「未確認」と明記している事項（確認できたら更新）

1. ConoHaコントロールパネルのログインURL・ログインボタン名（conoha.html STEP 5）
2. ConoHa申込画面で WordPress 関連項目を省略する具体的な操作（conoha.html STEP 1・2）
3. ConoHa ファイルマネージャーでのZIP展開機能の有無（公式ガイドに記載なし）
4. エックスサーバーのファイルマネージャーで「フォルダごと」のアップロードが可能か（公式マニュアルはファイルのドロップのみ記載 → 本書は「新規フォルダ＋ファイル」または「ZIP＋展開」で案内）
5. 各社の管理画面スクリーンショットの利用可否（ConoHa規約は取得不可、Xserver規約は許可なき利用不可）→ 現在はオリジナル図のみ使用
