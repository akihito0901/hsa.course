# HSA 会員システム セットアップ手順

受講生ログイン＋**買い切り（一括購入）決済**を動かすための設定です。
**コードは実装済み。以下の「アカウント作成」と「キーの登録」だけ行えば動きます。**

販売方式：**1回購入すれば、全7コース71教材が期限なしですべて読める。**
月額料金・週次解放はありません。

---

## 1. Supabase（ログイン・会員データベース）

1. https://supabase.com で無料登録し、New project を作成（リージョンは Tokyo 推奨）。
2. 左メニュー **SQL Editor** を開き、`db/schema.sql` の中身を貼り付けて **Run**。
   - すでに月額課金版で運用していたプロジェクトの場合は、代わりに
     **`db/migrate-onetime.sql`** を実行してください（列を追加する移行用SQL）。
3. **Project Settings → API** で以下を控える：
   - `Project URL`（例 `https://xxxx.supabase.co`）
   - `publishable`（旧 anon public）キー … 公開用
   - `secret`（旧 service_role）キー … **秘密**・サーバー専用
4. **Authentication → Providers → Email** を有効化。
5. **Authentication → URL Configuration → Site URL** を本番URLにする。
   （ここが `localhost:3000` のままだと、確認メールのリンクがエラーになります）
6. （Googleログインも使う場合）**Providers → Google** を有効化。

## 2. Stripe（決済）

1. https://stripe.com で登録。まずは **テストモード**でOK。
2. **Products → 商品を追加** → 料金は **「一回限り」** で作成します。
   **「継続」を選ばないでください**（買い切りなので月額ではありません）。
   作成後の **Price ID**（`price_...`）を控える。
3. **Developers → API keys** の **Secret key**（`sk_test_...`）を控える。
4. **Developers → Webhooks → エンドポイントを追加**：
   - URL: `https://hsa-course.vercel.app/api/webhook`
   - 送信イベント：
     - `checkout.session.completed`（必須。購入を反映する）
     - `checkout.session.async_payment_succeeded`（コンビニ払い等を使うなら）
     - `payment_intent.succeeded`（保険）
     - `charge.refunded`（全額返金したら閲覧権を自動で取り消す）
     - `charge.dispute.created`（チャージバック時に取り消す）
   - 作成後の **Signing secret**（`whsec_...`）を控える。

## 3. 公開キーをコードに入れる

`assets/config.js` を編集（**公開してよい値だけ**）：
```js
window.HSA_CONFIG = {
  SUPABASE_URL:      'https://xxxx.supabase.co',
  SUPABASE_ANON_KEY: 'publishable キー',
  PRICE_LABEL:       '98,000円'   // ボタンに出す表示だけ。空文字なら金額を出さない
};
```
※ 実際に請求される金額は Stripe の Price ID で決まります。
　金額を変えるときは **Stripe の Price と `PRICE_LABEL` の両方**を直してください。

## 4. 秘密キーを Vercel に入れる

Vercel → プロジェクト → **Settings → Environment Variables** に登録（`.env.example` 参照）：

| Name | 値 |
|------|----|
| `SUPABASE_URL` | Supabase の Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | secret キー（秘密） |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PRICE_ID` | `price_...`（**一回限りの価格**） |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `SITE_URL` | `https://hsa-course.vercel.app` |

環境変数を変えたら、**Vercel で再デプロイ**しないと反映されません。

## 5. 自分を管理者にする

一度サイトで新規登録したあと、Supabase の SQL Editor で：
```sql
update public.profiles set is_admin = true where email = 'あなたのメール';
```

## 6. 銀行振込など、Stripeを通さずに販売したとき

その人が一度サイトに登録したあと、SQL Editor で手動開放できます：
```sql
update public.profiles set is_paid = true, paid_at = now() where email = 'buyer@example.com';
```

---

## 動作の仕組み

- **基礎コース**：常に全開放（ログイン不要で読める）
- **他コース**：第1章のみ無料。2章以降は購入者限定
- **購入すると**：`is_paid = true` になり、**その場で全71教材が開く**（期限なし）
- **全額返金・チャージバック**：Webhook が `is_paid = false` に戻して閲覧権を取り消す
- **管理者**：購入の有無に関係なく全教材を確認可＋受講生一覧を閲覧

## 既知の制限

教材のアクセス制御はブラウザ側で動いています。ページのソースを直接見れば、
購入者限定の本文は読み取れてしまいます（普通の受講生には効きますが、
本気で守るならサーバー側から本文を配信する作りに変える必要があります）。
