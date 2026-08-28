/* ══ HSA 公開設定（ブラウザに出てOKなキーのみ） ══
   ここに書くのは「公開してよいキー」だけ:
     - Supabase の Project URL と anon（公開）キー
     - Stripe の月額プラン Price ID
   ⚠️ 秘密キー（Supabase service_role / Stripe secret / Webhook secret）は
      絶対にここへ書かないでください。Vercel の環境変数に設定します。 */
window.HSA_CONFIG = {
  SUPABASE_URL:      'https://apfmvcdiiiavcsoxdkfp.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_8oP6r4QceulHxEZAbuNVWA_B0xty8dA',
  MONTHLY_PRICE_ID:  'price_1U80Y01YKph3V7ufxWJNSWQz'      // ←Stripeの月額Price ID（サンドボックス）
};
