import Stripe from 'stripe';

let cachedClient: { key: string; client: Stripe } | null = null;

/**
 * Cloudflare Workers have no Node `http`/`crypto` module, so stripe-node must
 * be told to use `fetch` for requests and Web Crypto for webhook signature
 * verification (see `verifyWebhookSignature` below).
 */
export function getStripeClient(secretKey: string): Stripe {
  if (cachedClient && cachedClient.key === secretKey) return cachedClient.client;

  const client = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
  cachedClient = { key: secretKey, client };
  return client;
}

export async function verifyWebhookSignature(
  stripe: Stripe,
  payload: string,
  signature: string,
  secret: string
): Promise<Stripe.Event> {
  const cryptoProvider = Stripe.createSubtleCryptoProvider();
  return stripe.webhooks.constructEventAsync(payload, signature, secret, undefined, cryptoProvider);
}
