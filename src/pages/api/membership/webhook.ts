import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { activateMembershipForSession, getMembershipKv, markPaymentTerminal } from '../../../lib/membership/store';
import { getStripeClient, verifyWebhookSignature } from '../../../lib/stripe';
import { sendMembershipConfirmationEmail } from '../../../lib/email/sendMembershipEmail';

export const prerender = false;

type WorkerEnv = {
  MEMBERSHIPS?: KVNamespace;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
};

export const POST: APIRoute = async ({ request }) => {
  const workerEnv = env as unknown as WorkerEnv;
  const secretKey = workerEnv.STRIPE_SECRET_KEY;
  const webhookSecret = workerEnv.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error('[membership webhook] Stripe is not configured (missing secret or webhook secret).');
    return new Response('Webhook not configured.', { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature.', { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripeClient(secretKey);

  let event;
  try {
    event = await verifyWebhookSignature(stripe, payload, signature, webhookSecret);
  } catch (error) {
    console.error('[membership webhook] Signature verification failed', error);
    return new Response('Invalid signature.', { status: 400 });
  }

  let kv: KVNamespace;
  try {
    kv = getMembershipKv(workerEnv);
  } catch (error) {
    console.error('[membership webhook] Membership storage is not configured.', error);
    // 500 so Stripe retries once storage is fixed, rather than silently dropping the event.
    return new Response('Storage not configured.', { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.payment_status !== 'paid') break;

        const { record, activated } = await activateMembershipForSession(kv, {
          stripeCheckoutSessionId: session.id,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
        });

        // Only send the welcome email when this call actually just activated
        // the membership — never on an idempotent no-op (already active, or
        // a stale/superseded session), which would otherwise re-send it on
        // every Stripe webhook retry. A failed send must never make this
        // webhook look like it failed — the membership is already recorded.
        if (activated) {
          try {
            await sendMembershipConfirmationEmail(workerEnv, record);
          } catch (emailError) {
            console.error('[membership webhook] Confirmation email failed (membership still activated)', emailError);
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        // The member abandoned Stripe's checkout page without paying and the
        // session timed out (Stripe's own signal for this, distinct from the
        // cancel_url redirect — which fires on the browser navigating back,
        // not necessarily on the session actually being dead).
        const session = event.data.object;
        await markPaymentTerminal(kv, session.id, 'cancelled');
        break;
      }

      case 'checkout.session.async_payment_failed': {
        // Delayed payment methods (e.g. bank debits) that end up failing
        // after the session was created.
        const session = event.data.object;
        await markPaymentTerminal(kv, session.id, 'failed');
        break;
      }

      default:
        // Acknowledge every other event type so Stripe doesn't retry it.
        break;
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('[membership webhook] Failed to process event', event.type, error);
    return new Response('Could not process event.', { status: 500 });
  }
};
