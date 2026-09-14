# HSA Learning Campus

全7コース・71教材の文章教材と、スマートフォンに対応した学習サイトです。

## ローカルで確認する

```powershell
npm run dev
```

http://127.0.0.1:4317 を開きます。このプレビューサーバーは静的画面の確認用です。決済APIは実行しません。

## 教材を編集する

- `content/base.json`：各教材の基礎解説HTML。キーは `lessons/basic-1.html` など。
- `content/basic.json`、`image.json`、`web.json`、`sns.json`、`writing.json`、`ai.json`、`sales.json`：各教材の追加解説、実践手順、具体例、ワークシート、課題、確認問題。
- `content/references.json`：公式情報・確認先。
- `content/videos.json`：動画URL。未登録の章は「動画は準備中」と表示します。
- `scripts/build.mjs`：教材HTMLと一覧用データを生成。
- `scripts/build-home.mjs`：トップページを生成。
- `assets/campus.css`、`assets/reader.css`、`assets/auth-screen.css`：画面のデザイン。

編集後は次を実行します。生成される `lessons/*.html` と `index.html` を直接変更すると、次のビルドで上書きされます。コース名・順序などの一覧情報は `assets/data.js` を読み込み、教材から算出する説明・読了時間などをビルド時に更新します。

```powershell
npm run build
npm run check
```

`scripts/refine-content.mjs` は今回の旧原稿修正に使った一度限りの移行記録です。通常の更新では実行しません。`content-audit.before.json` は改訂前の本文控えです。

## 動画を追加する

`content/videos.json` に教材番号を指定して登録し、再ビルドします。以下のURLは記入例なので、実際の動画に置き換えてください。

```json
{
  "basic-1": {
    "type": "embed",
    "url": "https://www.youtube-nocookie.com/embed/VIDEO_ID"
  },
  "basic-2": {
    "type": "mp4",
    "url": "https://example.com/lesson.mp4"
  }
}
```

埋め込みは YouTube のプライバシー強化ドメインと `player.vimeo.com` に対応します。MP4を含めHTTPSが必要です。

## 今回の改訂と検証

[改訂記録](docs/REVISION.md) に変更内容、検証範囲、運用上の前提をまとめています。既存の認証・決済設定は `SETUP.md` を参照してください。
