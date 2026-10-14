// GET /api/admin-students … 管理者だけが全受講生の購入状況を取得する
import { supabaseAdmin, json, bearer } from '../../server/clients.js';

export async function onRequest({ request, env }) {
  try {
    const admin = supabaseAdmin(env);
    const token = bearer(request);
    if (!token) return json({ error: 'ログイン情報が送られていません' }, 401);
    const { data: { user }, error } = await admin.auth.getUser(token);
    // 原因を握りつぶすと調べようがないので、そのまま返す
    if (error || !user) return json({ error: 'unauthorized: ' + (error?.message || 'ユーザーを特定できません') }, 401);

    const { data: me } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!me?.is_admin) return json({ error: 'forbidden' }, 403);

    const { data: students, error: listErr } = await admin
      .from('profiles')
      .select('email, is_paid, paid_at, is_admin, created_at')
      .order('created_at', { ascending: false });

    // 列が無い等の失敗を握りつぶすと「受講生0人」に見えてしまうので、そのまま返す
    if (listErr) {
      const hint = /is_paid|paid_at/.test(listErr.message || '')
        ? '（db/migrate-onetime.sql をSupabaseで実行すると解決します）'
        : '';
      return json({ error: listErr.message + hint }, 500);
    }
    return json({ students: students || [] });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
