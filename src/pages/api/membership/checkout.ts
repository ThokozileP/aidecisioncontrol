import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { membershipApplicationSchema } from '../../../lib/membership/schema';
import { saveApplication, findReusableApplication, getMembershipKv } from '../../../lib/membership/store';
import { MEMBERSHIP_ANNUAL_FEE_CENTS, MEMBERSHIP_CURRENCY, MEMBERSHIP_PRODUCT_NAME } from '../../../lib/membership/types';
import { getStripeClient } from '../../../lib/stripe';
import { SITE } from '../../../consts';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  if (typeof body !== 'object' || body === null) {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { idempotencyKey, applicationId: submittedApplicationId, ...applicationInput } = body as Record<string, unknown>;

  const parsed = membershipApplicationSchema.safeParse(applicationInput);
  if (!parsed.success) {
    return json({ error: 'Invalid application data.', issues: parsed.error.issues }, 400);
  }

  if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 8) {
    return json({ error: 'Missing idempotency key.' }, 400);
  }

  const kv = (() => {
    try {
      return getMembershipKv(env as unknown as { MEMBERSHIPS?: KVNamespace });
    } catch {
      return null;
    }
  })();
  if (!kv) {
    return json({ error: 'Membership storage is not configured. See README.md for setup.' }, 503);
  }

  const secretKey = (env as unknown as { STRIPE_SECRET_KEY?: string }).STRIPE_SECRET_KEY;
  if (!secretKey) {
    return json({ error: 'Payment processing is not configured. See README.md for setup.' }, 503);
  }

  const stripe = getStripeClient(secretKey);

  // A retry after a cancelled/expired Stripe session reuses the original
  // application (same applicationId) instead of piling up a new abandoned
  // record per attempt — but only when it's genuinely still pending and
  // belongs to the same email, never an already-paid or someone else's record.
  const reusable = await findReusableApplication(
    kv,
    typeof submittedApplicationId === 'string' ? submittedApplicationId : null,
    parsed.data.email
  );
  const applicationId = reusable?.applicationId ?? crypto.randomUUID();

  // The client determines nothing about price — the amount charged is fixed
  // here, server-side, regardless of anything submitted by the browser.
  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer_email: parsed.data.email,
        client_reference_id: applicationId,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: MEMBERSHIP_CURRENCY,
              unit_amount: MEMBERSHIP_ANNUAL_FEE_CENTS,
              product_data: {
                name: MEMBERSHIP_PRODUCT_NAME,
                description: 'Professional Membership — 12 months from activation.',
              },
            },
          },
        ],
        success_url: `${SITE.url}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE.url}/membership?payment=cancelled`,
        metadata: { applicationId },
      },
      { idempotencyKey }
    );

    await saveApplication(kv, applicationId, session.id, parsed.data, reusable);

    return json({ url: session.url, applicationId });
  } catch (error) {
    console.error('[membership checkout] Stripe error', error);
    return json({ error: 'Could not start payment. Please try again.' }, 502);
  }
};
