// Cloudflare Pages Functions 用の共通部品（functions/api/*.js から読む）
// 秘密キーは Cloudflare の環境変数（Pages → Settings → Variables and Secrets）に入れる。コードには書かない。
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// 環境変数の値を掃除して読む。
// 入力欄に値を複数行で貼ってしまうと改行入りの文字列になり、HTTPヘッダーに使えず 401 になる。
// 1行目だけを取り出し、前後の空白を落として使う。
export const clean = (v) => String(v || '').split(/[\r\n]/)[0].trim();

export function stripeClient(env) {
  // Workers には Node の http が無いので、fetch で通信する
  return new Stripe(clean(env.STRIPE_SECRET_KEY), { httpClient: Stripe.createFetchHttpClient() });
}

export function supabaseAdmin(env) {
  return createClient(clean(env.SUPABASE_URL), clean(env.SUPABASE_SERVICE_ROLE_KEY), {
    auth: { persistSession: false }
  });
}

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export const bearer = (request) => (request.headers.get('authorization') || '').replace('Bearer ', '');
