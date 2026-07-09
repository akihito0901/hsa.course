// POST /api/webhook … Stripe からの通知を受けて会員状態を更新する
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Stripe 署名検証のため、生のリクエストボディが必要（bodyParser を無効化）
export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(typeof c === 'string' ? Buffer.from(c) : c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function userIdFromSub(sub) {
  if (sub?.metadata?.supabase_id) return sub.metadata.supabase_id;
  const { data } = await admin.from('profiles').select('id').eq('stripe_customer_id', sub.customer).single();
  return data?.id || null;
}

// 課金状態を profiles に反映。sub_started_at は初回課金時のみ設定（週次解放の起点を固定）
async function applySubscription(userId, sub) {
  if (!userId) return;
  const active = ['active', 'trialing'].includes(sub.status);
  const patch = {
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
    sub_status: active ? 'active' : sub.status,
    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString()
  };
  const { data: prof } = await admin.from('profiles').select('sub_started_at').eq('id', userId).single();
  if (active && !prof?.sub_started_at) patch.sub_started_at = new Date().toISOString();
  await admin.from('profiles').update(patch).eq('id', userId);
}

export default async function handler(req, res) {
  let event;
  try {
    const raw = await readRaw(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send('signature error: ' + err.message);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        const userId = s.client_reference_id || s.metadata?.supabase_id;
        if (s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription);
          await applySubscription(userId || await userIdFromSub(sub), sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        await applySubscription(await userIdFromSub(sub), sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = await userIdFromSub(sub);
        if (userId) {
          await admin.from('profiles')
            .update({ sub_status: 'canceled', updated_at: new Date().toISOString() })
            .eq('id', userId);
        }
        break;
      }
    }
  } catch (err) {
    res.status(500).send('handler error: ' + err.message);
    return;
  }
  res.status(200).json({ received: true });
}
