// Supabase の無料プランは、1週間ほど使われないと自動で一時停止する（2026-10-14 に止まっていた）。
// 1日1回、軽い問い合わせをして「使われている」状態を保つ。受講生が増えて Pro にしたら止めてよい。
// キーは公開用（publishable）。assets/config.js に出ているものと同じで、秘密ではない。
const SUPABASE_URL = 'https://apfmvcdiiiavcsoxdkfp.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_8oP6r4QceulHxEZAbuNVWA_B0xty8dA';

async function ping() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, {
    headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${PUBLISHABLE_KEY}` }
  });
  return `${res.status} ${new Date().toISOString()}`;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(ping().then((r) => console.log('supabase keepalive', r)));
  },
  // 手で確かめる用（ブラウザで開くと結果が出る）
  async fetch() {
    return new Response('supabase keepalive: ' + await ping());
  }
};
