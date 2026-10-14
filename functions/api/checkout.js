// POST /api/checkout … 買い切り（一括購入）の Stripe Checkout を開始する
import { stripeClient, supabaseAdmin, clean, json, bearer } from '../../server/clients.js';

export async function onRequestPost({ request, env }) {
  try {
    const admin = supabaseAdmin(env);
    const stripe = stripeClient(env);
    const { data: { user }, error } = await admin.auth.getUser(bearer(request));
    if (error || !user) return json({ error: 'unauthorized' }, 401);

    // すでに購入済みなら、二重に買わせない
    const { data: profile } = await admin
      .from('profiles').select('is_paid, stripe_customer_id').eq('id', user.id).single();
    if (profile?.is_paid) return json({ error: 'already purchased' }, 400);

    // 既存の Stripe 顧客IDを取得、なければ作成
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_id: user.id } });
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const origin = request.headers.get('origin') || clean(env.SITE_URL) || new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',                       // 買い切り（1回きりの支払い）
      customer: customerId,
      line_items: [{ price: clean(env.STRIPE_PRICE_ID), quantity: 1 }],
      success_url: origin + '/index.html?checkout=success',
      cancel_url: origin + '/index.html?checkout=cancel',
      client_reference_id: user.id,
      metadata: { supabase_id: user.id },
      payment_intent_data: { metadata: { supabase_id: user.id } },
      invoice_creation: { enabled: true }    // 購入者に領収書（インボイス）を発行する
    });
    return json({ url: session.url });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

