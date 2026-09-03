// POST /api/checkout … 買い切り（一括購入）の Stripe Checkout を開始する
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user) { res.status(401).json({ error: 'unauthorized' }); return; }

    // すでに購入済みなら、二重に買わせない
    const { data: profile } = await admin
      .from('profiles').select('is_paid, stripe_customer_id').eq('id', user.id).single();
    if (profile?.is_paid) { res.status(400).json({ error: 'already purchased' }); return; }

    // 既存の Stripe 顧客IDを取得、なければ作成
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_id: user.id } });
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const origin = req.headers.origin || process.env.SITE_URL || '';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',                       // 買い切り（1回きりの支払い）
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: origin + '/index.html?checkout=success',
      cancel_url: origin + '/index.html?checkout=cancel',
      client_reference_id: user.id,
      metadata: { supabase_id: user.id },
      payment_intent_data: { metadata: { supabase_id: user.id } },
      invoice_creation: { enabled: true }    // 購入者に領収書（インボイス）を発行する
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
