# HSA 会員システム セットアップ手順

受講生ログイン＋月額課金＋週次解放を動かすための設定です。
**コードは実装済み。以下の「アカウント作成」と「キーの登録」だけ行えば動きます。**

---

## 1. Supabase（ログイン・会員データベース）

1. https://supabase.com で無料登録し、New project を作成（リージョンは Tokyo 推奨）。
2. 左メニュー **SQL Editor** を開き、`db/schema.sql` の中身を貼り付けて **Run**。
3. **Project Settings → API** で以下を控える：
   - `Project URL`（例 `https://xxxx.supabase.co`）
   - `anon public` キー（公開用）
   - `service_role` キー（**秘密**・サーバー専用）
4. **Authentication → Providers → Email** を有効化。
   （テスト中は「Confirm email」をオフにすると登録がすぐ通って楽です）
5. （Googleログインも使う場合）**Providers → Google** を有効化し、GoogleのOAuth設定を登録。

## 2. Stripe（決済）

1. https://stripe.com で登録。まずは **テストモード**でOK。
2. **Products → 商品を追加** → 料金は「継続」「月額」で作成（例: ¥2,980 / 月）。
   作成後の **Price ID**（`price_...`）を控える。
3. **Developers → API keys** の **Secret key**（`sk_test_...`）を控える。
4. **Developers → Webhooks → エンドポイントを追加**：
   - URL: `https://hsa-course.vercel.app/api/webhook`
   - 送信イベント: `checkout.session.completed` /
     `customer.subscription.created` / `customer.subscription.updated` /
     `customer.subscription.deleted`
   - 作成後の **Signing secret**（`whsec_...`）を控える。

## 3. 公開キーをコードに入れる

`assets/config.js` を編集（**公開してよいキーだけ**）：
```js
window.HSA_CONFIG = {
  SUPABASE_URL:      'https://xxxx.supabase.co',
  SUPABASE_ANON_KEY: 'anon public キー',
  MONTHLY_PRICE_ID:  'price_xxxx'
};
```

## 4. 秘密キーを Vercel に入れる

Vercel → プロジェクト → **Settings → Environment Variables** に登録（`.env.example` 参照）：

| Name | 値 |
|------|----|
| `SUPABASE_URL` | Supabase の Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role キー（秘密） |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PRICE_ID` | `price_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `SITE_URL` | `https://hsa-course.vercel.app` |

## 5. 公開

`feature/membership` ブランチを `main` にマージ → Vercel が自動デプロイ。

## 6. 自分を管理者にする

一度サイトで新規登録したあと、Supabase の SQL Editor で：
```sql
update public.profiles set is_admin = true where email = 'あなたのメール';
```

---

## 動作の仕組み（要件との対応）
- **基礎コース**：常に全開放（ログインだけで読める）
- **他コース**：第1章のみ無料、2章以降はロック
- **課金すると**：`sub_status = active` になり、`sub_started_at`（課金日）を起点に
  **1週間ごとに1章ずつ解放**（2章＝1週後、3章＝2週後…）
- **管理者**：ロック無視で全教材を確認可＋受講生一覧を閲覧
