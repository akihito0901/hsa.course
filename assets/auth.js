/* ══ HSA 認証・会員ヘルパー（受講生ページ共通） ══
   前提: このファイルの前に次の2つを読み込むこと
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="assets/config.js"></script>
*/
(function () {
  const cfg = window.HSA_CONFIG || {};
  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  const HSA = (window.HSA = window.HSA || {});
  HSA.sb = sb;

  /* ── サイト内のパス解決 ──
     lessons/ 配下から呼ばれても、ルートの login.html / index.html に正しく戻れるようにする */
  const inLessons = /\/lessons\//.test(location.pathname);
  HSA.base = inLessons ? '../' : '';
  // サイトルートから見た現在ページ（例: 'index.html' / 'lessons/sns-3.html'）
  HSA.currentPath = function () {
    const file = location.pathname.split('/').pop() || 'index.html';
    return (inLessons ? 'lessons/' : '') + file;
  };
  HSA.loginUrl = function (next) {
    return HSA.base + 'login.html?next=' + encodeURIComponent(next || HSA.currentPath());
  };
  HSA.gotoLogin = function (next) { location.href = HSA.loginUrl(next); };

  const DAY = 24 * 60 * 60 * 1000;
  const WEEK = 7 * DAY;

  HSA.getSession = async function () {
    const { data } = await sb.auth.getSession();
    return data.session;
  };

  // ログイン必須ページで呼ぶ。未ログインなら login.html へ飛ばす
  HSA.requireLogin = async function () {
    const s = await HSA.getSession();
    if (!s) { HSA.gotoLogin(); return null; }
    return s;
  };

  // 自分の会員プロフィールを取得
  HSA.getProfile = async function () {
    const s = await HSA.getSession();
    if (!s) return null;
    const { data } = await sb.from('profiles').select('*').eq('id', s.user.id).single();
    return data;
  };

  HSA.logout = async function () {
    await sb.auth.signOut();
    location.href = HSA.base + 'index.html';
  };

  // 課金開始日からの経過週数（0起点）。未課金は0
  HSA.elapsedWeeks = function (profile) {
    if (!profile || profile.sub_status !== 'active' || !profile.sub_started_at) return 0;
    const start = new Date(profile.sub_started_at).getTime();
    return Math.floor((Date.now() - start) / WEEK);
  };
  HSA.daysUntilUnlock = function (profile, idx) {
    if (!profile || !profile.sub_started_at) return idx * 7;
    const start = new Date(profile.sub_started_at).getTime();
    const elapsedDays = Math.floor((Date.now() - start) / DAY);
    return Math.max(0, idx * 7 - elapsedDays);
  };
  HSA.isActive = function (profile) {
    return !!profile && profile.sub_status === 'active';
  };

  /* 教材1件のアクセス状態を判定
     catId: カテゴリID, lesson: 教材, idx: カテゴリ内の何番目(0起点)
     戻り値: 'soon'（本文未作成）| 'free' | 'live'（解放済み）| 'member'（要課金）| 'week'（課金済みだが今週はまだ）| 'admin' */
  HSA.getAccess = function (profile, catId, lesson, idx) {
    if (!lesson.url) return 'soon';
    if (profile && profile.is_admin) return 'admin';
    if (catId === 'basic') return 'free';   // 基礎は常に全開放
    if (idx === 0) return 'free';           // 他コースは第1章のみ無料
    if (!HSA.isActive(profile)) return 'member';
    return HSA.elapsedWeeks(profile) >= idx ? 'live' : 'week';
  };

  // Stripe Checkout（課金）を開始
  HSA.startCheckout = async function () {
    const s = await HSA.getSession();
    if (!s) { HSA.gotoLogin(); return; }
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + s.access_token }
    });
    const json = await res.json();
    if (json.url) location.href = json.url;
    else alert('決済ページを開けませんでした: ' + (json.error || '不明なエラー'));
  };

  // Stripe カスタマーポータル（解約・支払い管理）を開く
  HSA.openBillingPortal = async function () {
    const s = await HSA.getSession();
    if (!s) return;
    const res = await fetch('/api/portal', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + s.access_token }
    });
    const json = await res.json();
    if (json.url) location.href = json.url;
    else alert('管理ページを開けませんでした: ' + (json.error || '不明なエラー'));
  };
})();
