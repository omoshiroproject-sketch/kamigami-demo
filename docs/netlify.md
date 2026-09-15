# Netlifyで公開する

このアプリはリポジトリのルートにあるVite SPAです。外部APIキーは不要です。Netlifyでのアカウント連携と公開ボタンの操作は利用者が行ってください。

## 入力する設定

| 項目 | 値 |
| --- | --- |
| Repository | `omoshiroproject-sketch/kamigami-demo` |
| Branch | デモを確認するなら `codex/kamigami-demo`。PRをマージ後は `main` |
| Base directory | **空欄** |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node.js | `24.19.0`（netlify.tomlで設定済み） |
| 必須の環境変数・秘密鍵 | なし |

1. Netlifyで「Add new project」→「Import an existing project」を選びます。
2. GitHubを連携し、上記リポジトリとブランチを選びます。
3. 設定表を確認して公開します。rootの`netlify.toml`からビルドと配信先を読み込めます。
4. ビルドログに成功が表示されたら、発行されたHTTPS URLを開きます。
5. スマートフォンでアクセスし、サンプル写真の保存→再読み込み→修正・削除を確認します。

## 公開後の確認

- `/shrines/ise`、`/gods/amaterasu`、`/photos/new`をURLから直接開き、再読み込みしても404にならない。
- `/icon.svg`、`/icon-192.png`、`/icon-512.png`、`/manifest.webmanifest`、`/samples/sample-1.svg`、`/version.json`がHTMLではなく該当ファイルとして配信される。
- 神社の地図を表示し、`© OpenStreetMap contributors`の帰属表示が見える。
- 御朱印写真・ノート・お気に入り・ポイントが同じURLで再読み込み後も残る。
- イベントや特典がすべてデモ表示であること、配送先入力や実決済がないことを確認する。
- iOSはSafari共有メニューから「ホーム画面に追加」、AndroidはChromeの「アプリをインストール」または「ホーム画面に追加」を試す。

`[[redirects]] from="/*" to="/index.html" status=200`は強制上書きにしていないため、存在する静的資産を優先して配信します。ローカルのViteプレビューでも深いURLと静的資産を確認しましたが、Netlifyの実配信は公開後に確認してください。

## 更新

ビルドごとに`version.json`とアプリ内の版番号を生成します。開いているアプリは60秒ごとに版を確認し、新版があれば保存後の更新を案内します。Service Workerは使っていないため、古いアプリ資産を独自キャッシュから復活させません。写真・個人記録はIndexedDBにあり、通常のコード更新では削除しません。

保存はドメインごとです。Deploy Preview URLから本公開URLへ移動しても記録は自動移行されません。長く使うURLを決めてから写真を保存してください。ブラウザデータを消すと復元できません。

## 地図サービス

OpenStreetMap標準タイルを画面に必要な範囲だけ使用します。一括取得、先読み保存、オフライン地図ダウンロードは行いません。ブラウザの通常のHTTPキャッシュに従い、Refererを抑止しません。必要なら`VITE_MAP_TILE_URL`で利用条件を確認したタイル提供元へ差し替えられます（帰属表示は提供元の条件に合わせてコードも変更してください）。無料標準タイルの可用性保証はなく、アクセス増加時には対応サービスを検討します。

## 参照した公式資料（2026-09-15）

- [Netlify：Vite設定](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- [Netlify：Gitリポジトリから公開](https://docs.netlify.com/start/quickstarts/deploy-from-repository/)
- [OpenStreetMap：タイル利用ポリシー](https://operations.osmfoundation.org/policies/tiles/)
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)
- [Apple Map Links](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html)
