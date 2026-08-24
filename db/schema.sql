-- ══════════════════════════════════════════════════════════════
--  HSA 会員システム  Supabase スキーマ
--  Supabase ダッシュボード → SQL Editor に貼り付けて実行してください。
-- ══════════════════════════════════════════════════════════════

-- 受講生プロフィール（会員状態を保持）
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text,
  is_admin               boolean     not null default false,
  -- 会員状態: none（未課金）/ active（課金中）/ canceled / past_due
  sub_status             text        not null default 'none',
  -- 週次解放の起点＝はじめて課金した日時（以後この日から1週ごとに解放）
  sub_started_at         timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 本人だけが自分のプロフィールを読める
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

-- 本人だけが自分のプロフィール行を作れる（初回登録時のフォールバック）
drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

--  ※ 会員状態(sub_status 等)の UPDATE ポリシーはあえて作りません。
--    更新はサーバー側(service_role)のWebhookからのみ行い、
--    受講生が自分で「課金中」に書き換えられないようにします。

-- 新規ユーザー登録時に profiles 行を自動作成
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 管理者を指定する例（登録後に自分のメールで実行）:
--   update public.profiles set is_admin = true where email = 'you@example.com';
