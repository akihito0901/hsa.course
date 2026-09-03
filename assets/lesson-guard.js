/* ══ HSA 教材ページ アクセス制御（買い切り方式） ══
   前提: このファイルの前に次の3つを読み込むこと（<head> 内、この順番で）
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="../assets/config.js"></script>
     <script src="../assets/auth.js"></script>

   ページ名（例: lessons/sns-3.html）からコースIDと章番号を読み取り、
   assets/auth.js の HSA.getAccess() と同じルールで表示・非表示を決めます。
     ・基礎コース（basic-*）………………… 誰でも全章無料
     ・各コースの第1章（*-1.html）………… 誰でも無料
     ・それ以外 ………………………………… ログイン＋購入が必要（購入すれば全部読める）
*/
(function () {
  var file = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var m = file.match(/^([a-z]+)-(\d+)$/);
  if (!m) return;

  var catId = m[1];
  var idx = parseInt(m[2], 10) - 1;   // 0起点（data-lesson の番号と同じ）
  var isFree = catId === 'basic' || idx === 0;
  if (isFree) return;                 // 無料公開ページは何もしない

  /* 判定が終わるまで本文を隠す（未購入の人に一瞬でも中身を見せないため） */
  var hider = document.createElement('style');
  hider.textContent = '.article,.complete-btn,.lesson-foot-nav{display:none !important}';
  document.head.appendChild(hider);

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  ready(function () {
    var wrap = document.querySelector('.lesson-wrap');
    var article = document.querySelector('.article');
    if (!wrap) { hider.remove(); return; }

    var panel = document.createElement('div');
    panel.className = 'lesson-lock';
    panel.innerHTML = '<div class="lesson-lock-check">確認しています…</div>';
    if (article) article.insertAdjacentElement('beforebegin', panel);
    else wrap.appendChild(panel);

    function unlock(isAdmin) {
      panel.remove();
      hider.remove();
      if (isAdmin) {
        var b = document.createElement('div');
        b.className = 'lesson-admin-bar';
        b.innerHTML = '👁 管理者プレビュー中：購入の有無に関係なく閲覧しています。' +
          '<a href="../index.html">教材一覧へ</a>';
        wrap.insertBefore(b, wrap.firstChild);
      }
    }

    function lock(html) {
      if (article) article.remove();          // 本文をDOMから取り除く
      var btn = document.querySelector('.complete-btn');
      if (btn) btn.remove();
      var nav = document.querySelector('.lesson-foot-nav');
      if (nav) nav.remove();
      hider.remove();
      panel.innerHTML = html;
    }

    if (!window.HSA || !window.HSA.getAccess) {
      lock('<div class="lesson-lock-ic">⚠️</div>' +
        '<h2 class="lesson-lock-h">教材を表示できませんでした</h2>' +
        '<p class="lesson-lock-p">通信環境を確認して、ページを再読み込みしてください。</p>' +
        '<a class="lesson-lock-btn ghost" href="../index.html">教材一覧へ戻る</a>');
      return;
    }

    (async function () {
      var session = null, profile = null;
      try {
        session = await HSA.getSession();
        if (session) profile = await HSA.getProfile();
      } catch (e) { /* 通信エラーは未ログイン扱いにする */ }

      var access = HSA.getAccess(profile, catId, { url: file + '.html' }, idx);

      if (access === 'admin') { unlock(true); return; }
      if (access === 'free' || access === 'live') { unlock(false); return; }

      // 未ログイン
      if (!session) {
        lock('<div class="lesson-lock-ic">🔑</div>' +
          '<h2 class="lesson-lock-h">この教材は購入者限定です</h2>' +
          '<p class="lesson-lock-p">すでに購入済みの方は、ログインするとこのまま読めます。' +
          '<br>基礎コースと、各コースの第1章は、登録なしで今すぐ読めます。</p>' +
          '<div class="lesson-lock-actions">' +
          '<a class="lesson-lock-btn" href="' + esc(HSA.loginUrl()) + '">ログイン・新規登録</a>' +
          '<a class="lesson-lock-btn ghost" href="../index.html">教材一覧へ戻る</a>' +
          '</div>');
        return;
      }

      // ログイン済み・未購入（access === 'locked'）
      var cfg = window.HSA_CONFIG || {};
      var label = cfg.PRICE_LABEL ? 'この講座を購入する（' + esc(cfg.PRICE_LABEL) + '）' : 'この講座を購入する';
      lock('<div class="lesson-lock-ic">🔒</div>' +
        '<h2 class="lesson-lock-h">この教材は購入者限定です</h2>' +
        '<p class="lesson-lock-p">一度ご購入いただくと、<strong>この教材を含む全71教材が、期限なしですべて読めるようになります。</strong>' +
        '<br>月額料金や追加の支払いはありません。</p>' +
        '<div class="lesson-lock-actions">' +
        '<button class="lesson-lock-btn" type="button" id="hsaLockBuy">' + label + '</button>' +
        '<a class="lesson-lock-btn ghost" href="../index.html">教材一覧へ戻る</a>' +
        '</div>');
      var buy = document.getElementById('hsaLockBuy');
      if (buy) buy.addEventListener('click', function () {
        buy.disabled = true;
        buy.textContent = '決済ページを開いています…';
        HSA.startCheckout().catch(function () {
          buy.disabled = false;
          buy.textContent = label;
        });
      });
    })();
  });
})();
