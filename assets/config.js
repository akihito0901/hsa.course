/* ══ HSA 公開設定（ブラウザに出てOKなキーのみ） ══
   ここに書くのは「公開してよいキー」だけ:
     - Supabase の Project URL と anon（公開）キー
     - Stripe の月額プラン Price ID
   ⚠️ 秘密キー（Supabase service_role / Stripe secret / Webhook secret）は
      絶対にここへ書かないでください。Vercel の環境変数に設定します。 */
window.HSA_CONFIG = {
  SUPABASE_URL:      'https://YOUR-PROJECT.supabase.co', // ←あとで差し替え
  SUPABASE_ANON_KEY: 'YOUR-SUPABASE-ANON-KEY',           // ←あとで差し替え
  MONTHLY_PRICE_ID:  'price_XXXXXXXXXXXX'                 // ←Stripeの月額Price ID
};
