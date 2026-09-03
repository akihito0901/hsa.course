/* ══ HSA 教材ページ アクセス制御 ══
   前提: このファイルの前に次の3つを読み込むこと（<head> 内、この順番で）
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="../assets/config.js"></script>
     <script src="../assets/auth.js"></script>

   ページ名（例: lessons/sns-3.html）からコースIDと章番号を読み取り、
   assets/auth.js の HSA.getAccess() と同じルールで表示・非表示を決めます。
     ・基礎コース（basic-*）………………… 誰でも全章無料
     ・各コースの第1章（*-1.html）………… 誰でも無料
     ・それ以外 ………………………………… ログイン＋月額会員＋入会からの経過週数が必要
*/
(function () {
  var file = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var m = file.match(/^([a-z]+)-(\d+)$/);
  if (!m) return;

  var catId = m[1];
  var idx = parseInt(m[2], 10) - 1;   // 0起点（data-lesson の番号と同じ）
  var isFree = catId === 'basic' || idx === 0;
  if (isFree) return;                 // 無料公開ページは何もしない

  /* 判定が終わるまで本文を隠す（未課金の人に一瞬でも中身を見せないため） */
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
        b.innerHTML = '👁 管理者プレビュー中：週の解放状況に関係なく閲覧しています。' +
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

      if (!session) {
        var loginUrl = HSA.loginUrl();
        lock('<div class="lesson-lock-ic">🔑</div>' +
          '<h2 class="lesson-lock-h">この教材を読むにはログインが必要です</h2>' +
          '<p class="lesson-lock-p">この章は月額会員向けの教材です。すでに会員の方はログインしてください。' +
          '<br>基礎コースと、各コースの第1章は、登録なしで今すぐ読めます。</p>' +
          '<div class="lesson-lock-actions">' +
          '<a class="lesson-lock-btn" href="' + esc(loginUrl) + '">ログイン・新規登録</a>' +
          '<a class="lesson-lock-btn ghost" href="../index.html">教材一覧へ戻る</a>' +
          '</div>');
        return;
      }

      if (access === 'week') {
        var days = HSA.daysUntilUnlock(profile, idx);
        lock('<div class="lesson-lock-ic">📅</div>' +
          '<h2 class="lesson-lock-h">第' + (idx + 1) + '週の教材です</h2>' +
          '<p class="lesson-lock-p">この教材は<strong>あと' + days + '日</strong>で解放されます。' +
          '教材は入会日から1週間ごとに1章ずつ開きます。' +
          '<br>それまでは、すでに開いている教材を復習しながらお待ちください。</p>' +
          '<div class="lesson-lock-actions">' +
          '<a class="lesson-lock-btn" href="../index.html">教材一覧へ戻る</a>' +
          '</div>');
        return;
      }

      // 支払い失敗中は「月額会員になる」を出さない（二重課金になるため）
      if (profile && profile.sub_status === 'past_due') {
        lock('<div class="lesson-lock-ic">⚠️</div>' +
          '<h2 class="lesson-lock-h">お支払いが確認できていません</h2>' +
          '<p class="lesson-lock-p">カードのお支払いが確認できていないため、会員限定の教材を一時的に閉じています。' +
          '<br><strong>カード情報を更新すると、すぐに元どおり開きます。</strong></p>' +
          '<div class="lesson-lock-actions">' +
          '<button class="lesson-lock-btn" type="button" id="hsaLockPortal">カード情報を更新する</button>' +
          '<a class="lesson-lock-btn ghost" href="../index.html">教材一覧へ戻る</a>' +
          '</div>');
        var portal = document.getElementById('hsaLockPortal');
        if (portal) portal.addEventListener('click', function () {
          portal.disabled = true;
          portal.textContent = '開いています…';
          HSA.openBillingPortal().catch(function () {
            portal.disabled = false;
            portal.textContent = 'カード情報を更新する';
          });
        });
        return;
      }

      // access === 'member'（ログイン済み・未課金）
      lock('<div class="lesson-lock-ic">🔒</div>' +
        '<h2 class="lesson-lock-h">この教材は月額会員限定です</h2>' +
        '<p class="lesson-lock-p">月額会員になると、入会日から1週間ごとに続きの教材が解放されていきます。' +
        '<br>基礎コースと、各コースの第1章は、これからも無料で読めます。</p>' +
        '<div class="lesson-lock-actions">' +
        '<button class="lesson-lock-btn" type="button" id="hsaLockJoin">月額会員になる</button>' +
        '<a class="lesson-lock-btn ghost" href="../index.html">教材一覧へ戻る</a>' +
        '</div>');
      var join = document.getElementById('hsaLockJoin');
      if (join) join.addEventListener('click', function () {
        join.disabled = true;
        join.textContent = '決済ページを開いています…';
        HSA.startCheckout().catch(function () {
          join.disabled = false;
          join.textContent = '月額会員になる';
        });
      });
    })();
  });
})();
