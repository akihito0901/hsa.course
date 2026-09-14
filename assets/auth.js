/* ══ HSA 認証・購入状態ヘルパー（受講生ページ共通） ══
   前提: このファイルの前に次の2つを読み込むこと
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="assets/config.js"></script>

   販売方式：買い切り（一括購入）。1回購入すれば、以後すべての教材が読める。
*/
(function () {
  const cfg = window.HSA_CONFIG || {};
  let sb = null;
  try {
    if (window.supabase) sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  } catch (_) { /* Free lessons remain usable if the authentication SDK is unavailable. */ }

  const HSA = (window.HSA = window.HSA || {});
  HSA.sb = sb;
  function withTimeout(promise) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('会員情報の確認がタイムアウトしました。通信環境を確認して再読み込みしてください。')), 10000);
      Promise.resolve(promise).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
    });
  }

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

  /* ログイン中のセッションを返す。
     アクセストークンは1時間で切れるため、期限が近ければ先に更新する。
     （期限切れのまま /api/* を呼ぶと 401 になり「ログインの有効期限が切れています」になる） */
  HSA.getSession = async function () {
    if (!sb) return null;
    const { data } = await withTimeout(sb.auth.getSession());
    let s = data.session;
    if (!s) return null;
    const expMs = (s.expires_at || 0) * 1000;
    if (!expMs || expMs - Date.now() < 60 * 1000) {
      const { data: r, error } = await withTimeout(sb.auth.refreshSession());
      if (error || !r?.session) return null;   // 更新できない＝ログインし直しが必要
      s = r.session;
    }
    return s;
  };

  // ログイン必須ページで呼ぶ。未ログインなら login.html へ飛ばす
  HSA.requireLogin = async function () {
    const s = await HSA.getSession();
    if (!s) { HSA.gotoLogin(); return null; }
    return s;
  };

  // 自分のプロフィール（購入状態）を取得
  HSA.getProfile = async function () {
    const s = await HSA.getSession();
    if (!s) return null;
    const { data, error } = await withTimeout(sb.from('profiles').select('*').eq('id', s.user.id).single());
    if (error) throw error;
    return data;
  };

  HSA.logout = async function () {
    if (!sb) throw new Error('会員機能へ接続できません。通信環境を確認してください。');
    await sb.auth.signOut();
    location.href = HSA.base + 'index.html';
  };

  // 購入済みかどうか
  HSA.hasPurchased = function (profile) {
    return !!profile && profile.is_paid === true;
  };
  HSA.isAdmin = function (profile) {
    return !!profile && profile.is_admin === true;
  };
  // 購入日（表示用の文字列。未購入なら null）
  HSA.purchasedOn = function (profile) {
    if (!HSA.hasPurchased(profile) || !profile.paid_at) return null;
    return new Date(profile.paid_at).toLocaleDateString('ja-JP');
  };

  /* 教材1件のアクセス状態を判定
     catId: カテゴリID, lesson: 教材, idx: カテゴリ内の何番目(0起点)
     戻り値:
       'soon'   … 本文がまだ無い（準備中）
       'free'   … 誰でも読める無料公開分
       'live'   … 購入済みで読める
       'locked' … 購入すると読める
       'admin'  … 管理者なので無条件で読める                     */
  HSA.getAccess = function (profile, catId, lesson, idx) {
    if (!lesson.url) return 'soon';
    if (HSA.isAdmin(profile)) return 'admin';
    if (catId === 'basic') return 'free';   // 基礎コースは常に全章無料
    if (idx === 0) return 'free';           // 他コースは第1章のみ無料
    return HSA.hasPurchased(profile) ? 'live' : 'locked';
  };

  // Stripe Checkout（買い切りの決済）を開始
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
})();
