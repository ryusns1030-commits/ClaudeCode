# 公式情報の参照元一覧

調査日：2026年11月16日（すべて公式サイトを直接取得して確認）

## ConoHa WING（support.conoha.jp）

| ページ | URL | 確認した内容 |
|---|---|---|
| ファイルマネージャーを利用する | https://support.conoha.jp/w/filemanager/ | コントロールパネル →「WING」→「サイト管理」→「ファイルマネージャー」。左の「public_html」→ドメイン名。「ファイルアップロード」→ドラッグ＆ドロップ／「ファイルを選択」「フォルダを選択」。右クリック→「削除」。ログイン画面が出た場合はFTPアカウント |
| よくある質問（FTP/SSH） | https://support.conoha.jp/wing/faq/ftpssh-q/ | アップロード先＝public_html 配下のドメイン名ディレクトリ。自動生成ディレクトリは削除しない |
| サーバーにドメインの設定を追加する | https://support.conoha.jp/w/adddomain/ | 「WING」→「サーバー管理」→「ドメイン」→「+ドメイン」→「新規ドメインを追加」→ 無料SSL「利用する」→「保存」 |
| 無料独自SSLを設定する | https://support.conoha.jp/w/letsencrypt/ | 「サイト管理」→「サイトセキュリティ」→ タブ「SSL」→「無料独自SSL」→「利用設定」を「利用する」。ネームサーバーがConoHaであること。httpsへ自動リダイレクト。短期間の複数回設定で申請制限 |
| WINGパックの契約状況を確認する | https://support.conoha.jp/w/checkwingpackagreement/ | 「WING」→「サーバー管理」→「契約情報」→「サーバー情報」→「プラン」 |
| ConoHa WING（WINGパック）お申し込み方法 | https://support.conoha.jp/c/easysetup/ | 料金タイプ→契約期間→プラン→お客様情報→電話/SMS認証→支払い→「お申し込み」。ドメイン情報認証メール |
| ドメインにネームサーバーを設定する | https://support.conoha.jp/w/domainnameserver/ | 反映まで最大24〜72時間 |
| 動作確認URLを使う | https://support.conoha.jp/w/checkurl/ | 「サイト管理」→「サイト設定」→「基本設定」→「動作確認URL」→「利用設定」ON |
| FTPアカウントを作成する | https://support.conoha.jp/w/ftpaccount/ | 「サイト管理」→「FTP」→「＋FTPアカウント」 |
| コンテンツキャッシュ機能を使う | https://support.conoha.jp/w/contentscache/ | 初期値 ON。「サイト管理」→「高速化」→「キャッシュ」→「コンテンツキャッシュ」→キャッシュクリア「クリア」 |

## エックスサーバー（www.xserver.ne.jp）

| ページ | URL | 確認した内容 |
|---|---|---|
| FAQ：ホームページのファイルはどこへアップロードすればいいですか？ | https://www.xserver.ne.jp/support/faq/service_ftp_setting_upload.php | ドメイン名フォルダ → public_html にアップロード。トップページは index.html。パスとURLの対応表 |
| マニュアル：ファイルマネージャ | https://www.xserver.ne.jp/manual/man_tool_file.php | ログインURL（FTPユーザーID/パスワード）、XServerアカウント「ご契約一覧 > サーバー」の「ファイル管理」。新規フォルダ／アップロード／展開／現在のパス |
| マニュアル：ドメイン設定 | https://www.xserver.ne.jp/manual/man_domain_setting.php | 新サーバーパネル「ドメイン設定」→「ドメインを追加」→「追加する」。反映 数時間〜最大24時間。自動作成フォルダ一覧。ドメイン設定削除でデータ削除 |
| マニュアル：無料独自SSL設定 | https://www.xserver.ne.jp/manual/man_server_ssl.php | 「SSL設定」→ 設定ボタンを「ON」。反映 最大1時間。http→https 自動転送はされない |
| マニュアル：XServerアカウント | https://www.xserver.ne.jp/manual/man_tool_xserver.php | ログインURL、メールアドレス（またはID）＋パスワード |
| マニュアル：サーバーパネル | https://www.xserver.ne.jp/manual/man_tool_server.php | ログインURL、XServerアカウントでログイン可 |
| FAQ：トラブル各項目 | https://www.xserver.ne.jp/support/faq/faq_service_hp_trouble.php | 初期ページ表示／403／404／画像×／無効なURL（30分〜1時間待つ） |
| マニュアル：サーバーキャッシュ設定 | https://www.xserver.ne.jp/manual/man_server_cache.php | キャッシュ時間 1〜2分 |
| お申し込みの流れ | https://www.xserver.ne.jp/order/index.php | 申込案内（リンクのみ） |
| 利用規約 | https://www.xserver.ne.jp/rule/rule.php | 第31条：同社が掲示した情報の知的財産権は同社に帰属、許可なく利用不可 → 管理画面画像は使用せず |

## OS（ZIP解凍）

| ページ | URL | 確認した内容 |
|---|---|---|
| Microsoft：ファイルを圧縮および展開する | https://support.microsoft.com/ja-jp/windows/experience/storage-filemanagement/zip-and-unzip-files | 右クリック →［すべて抽出］（※実機の表示は「すべて展開」の場合あり。本書は両方を併記） |
| Apple：Macでファイルやフォルダを圧縮する/解凍する | https://support.apple.com/ja-jp/guide/mac-help/mchlp2528/mac | .zip をダブルクリックで同じフォルダに解凍 |

## 取得できなかったページ

- `https://www.conoha.jp/wing/`（サービスページ・料金ページ）、`https://www.conoha.jp/agreement/`（会員規約）：自動取得がサイト側で拒否（HTTP 403）されたため未確認。
  → 料金・プランは本書に記載せず、管理画面の画像利用許可も確認できなかったため **スクリーンショットは不使用**。
- ConoHaコントロールパネルのログインURL・ボタン名：サポートページ内に記載がなく未確認（本書でも「未確認事項」と明記）。
