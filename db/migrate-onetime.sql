-- ══════════════════════════════════════════════════════════════
--  月額課金（週次解放）→ 買い切り（一括購入・全解放）への移行
--
--  すでに db/schema.sql を実行済みの Supabase プロジェクトで、
--  SQL Editor に貼り付けて 1 回だけ実行してください。
--  何度実行しても壊れないように書いてあります。
-- ══════════════════════════════════════════════════════════════

-- 1. 買い切り用の列を追加する
alter table public.profiles add column if not exists is_paid                  boolean not null default false;
alter table public.profiles add column if not exists paid_at                  timestamptz;
alter table public.profiles add column if not exists stripe_payment_intent_id text;

-- 2. 月額課金の時代に「課金中」だった人を、購入済みとして引き継ぐ
--    （テストデータしか無ければ、何も更新されないのが正常です）
update public.profiles
   set is_paid = true,
       paid_at = coalesce(paid_at, sub_started_at, now())
 where is_paid = false
   and sub_status = 'active';

-- 3. 確認用（実行すると現在の全ユーザーの状態が出ます）
select email, is_admin, is_paid, paid_at from public.profiles order by created_at desc;

-- ──────────────────────────────────────────────────────────────
-- 4. 【任意・あとで】定期課金の名残の列を消す
--    しばらく様子を見て、問題なければ次の4行を実行してください。
--    消すと元に戻せないので、急ぐ必要はありません。
--
-- alter table public.profiles drop column if exists sub_status;
-- alter table public.profiles drop column if exists sub_started_at;
-- alter table public.profiles drop column if exists stripe_subscription_id;
-- alter table public.profiles drop column if exists current_period_end;
