// POST /api/checkout … 月額課金の Stripe Checkout を開始する
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

    // 既存の Stripe 顧客IDを取得、なければ作成
    const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', user.id).single();
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_id: user.id } });
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const origin = req.headers.origin || process.env.SITE_URL || '';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: origin + '/index.html?checkout=success',
      cancel_url: origin + '/index.html?checkout=cancel',
      client_reference_id: user.id,
      metadata: { supabase_id: user.id },
      subscription_data: { metadata: { supabase_id: user.id } }
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
