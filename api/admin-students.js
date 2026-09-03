// GET /api/admin-students … 管理者だけが全受講生の購入状況を取得する
import { createClient } from '@supabase/supabase-js';

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export default async function handler(req, res) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user) { res.status(401).json({ error: 'unauthorized' }); return; }

    const { data: me } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!me?.is_admin) { res.status(403).json({ error: 'forbidden' }); return; }

    const { data: students, error: listErr } = await admin
      .from('profiles')
      .select('email, is_paid, paid_at, is_admin, created_at')
      .order('created_at', { ascending: false });

    // 列が無い等の失敗を握りつぶすと「受講生0人」に見えてしまうので、そのまま返す
    if (listErr) {
      const hint = /is_paid|paid_at/.test(listErr.message || '')
        ? '（db/migrate-onetime.sql をSupabaseで実行すると解決します）'
        : '';
      res.status(500).json({ error: listErr.message + hint });
      return;
    }

    res.status(200).json({ students: students || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
