/* ══ HSA 公開設定（ブラウザに出てOKなキーのみ） ══
   ここに書くのは「公開してよい値」だけ:
     - Supabase の Project URL と publishable（公開）キー
     - 画面に出す価格の表示テキスト
   ⚠️ 秘密キー（Supabase service_role / Stripe secret / Webhook secret）は
      絶対にここへ書かないでください。Vercel の環境変数に設定します。
   ⚠️ 実際に請求される金額は Stripe 側の Price ID（Vercelの STRIPE_PRICE_ID）で
      決まります。PRICE_LABEL は表示専用なので、金額を変えたら両方直してください。 */
window.HSA_CONFIG = {
  SUPABASE_URL:      'https://apfmvcdiiiavcsoxdkfp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_8oP6r4QceulHxEZAbuNVWA_B0xty8dA',

  // ボタンに出す価格の表示（例: '98,000円'）。空文字にすると金額を出さない
  PRICE_LABEL: ''
};
