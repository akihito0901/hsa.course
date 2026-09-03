// POST /api/webhook … Stripe からの通知を受けて購入状態を更新する（買い切り方式）
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

// Stripe の顧客IDから受講生を引き当てる（metadata が無い場合の保険）
async function userIdFromCustomer(customerId) {
  if (!customerId) return null;
  const { data } = await admin.from('profiles').select('id').eq('stripe_customer_id', customerId).single();
  return data?.id || null;
}

// 購入を profiles に反映。paid_at は初回のみ設定する
async function applyPurchase(userId, { customerId, paymentIntentId }) {
  if (!userId) return;
  const { data: prof } = await admin.from('profiles').select('paid_at').eq('id', userId).single();
  const patch = {
    is_paid: true,
    updated_at: new Date().toISOString()
  };
  if (customerId) patch.stripe_customer_id = customerId;
  if (paymentIntentId) patch.stripe_payment_intent_id = paymentIntentId;
  if (!prof?.paid_at) patch.paid_at = new Date().toISOString();
  await admin.from('profiles').update(patch).eq('id', userId);
}

// 返金されたら閲覧権を取り消す
async function revokePurchase(userId) {
  if (!userId) return;
  await admin.from('profiles')
    .update({ is_paid: false, updated_at: new Date().toISOString() })
    .eq('id', userId);
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
      // 決済ページで支払いが完了した
      case 'checkout.session.completed': {
        const s = event.data.object;
        if (s.payment_status !== 'paid') break;      // 後払い等で未入金ならまだ開けない
        const userId = s.client_reference_id
          || s.metadata?.supabase_id
          || await userIdFromCustomer(s.customer);
        await applyPurchase(userId, {
          customerId: s.customer,
          paymentIntentId: typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id
        });
        break;
      }

      // コンビニ払い・銀行振込など、あとから入金が確定した場合の保険
      case 'checkout.session.async_payment_succeeded': {
        const s = event.data.object;
        const userId = s.client_reference_id
          || s.metadata?.supabase_id
          || await userIdFromCustomer(s.customer);
        await applyPurchase(userId, {
          customerId: s.customer,
          paymentIntentId: typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id
        });
        break;
      }

      // 支払い成立（Checkout を通さず請求した場合もここで開放される）
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const userId = pi.metadata?.supabase_id || await userIdFromCustomer(pi.customer);
        await applyPurchase(userId, { customerId: pi.customer, paymentIntentId: pi.id });
        break;
      }

      // 全額返金されたら閲覧権を取り消す（一部返金では取り消さない）
      case 'charge.refunded': {
        const ch = event.data.object;
        if (ch.amount_refunded < ch.amount) break;
        const userId = ch.metadata?.supabase_id || await userIdFromCustomer(ch.customer);
        await revokePurchase(userId);
        break;
      }

      // チャージバック（カード会社への異議申し立て）が起きたら取り消す
      // このイベントの本体は charge ではなく dispute なので、charge を引き直す
      case 'charge.dispute.created': {
        const dispute = event.data.object;
        const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
        if (!chargeId) break;
        const ch = await stripe.charges.retrieve(chargeId);
        const userId = ch.metadata?.supabase_id || await userIdFromCustomer(ch.customer);
        await revokePurchase(userId);
        break;
      }
    }
  } catch (err) {
    res.status(500).send('handler error: ' + err.message);
    return;
  }
  res.status(200).json({ received: true });
}
