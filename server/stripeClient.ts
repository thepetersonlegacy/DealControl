import Stripe from 'stripe';

// Get Stripe credentials from environment variables (Railway/production)
// Falls back to Replit connector system if available
function getCredentials() {
  // First try environment variables (Railway deployment)
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.Publishable_key || process.env.STRIPE_PUBLISHABLE_KEY;

  if (secretKey) {
    return {
      publishableKey: publishableKey || '',
      secretKey,
    };
  }

  throw new Error('STRIPE_SECRET_KEY environment variable not set');
}

export async function getUncachableStripeClient() {
  const { secretKey } = getCredentials();

  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function getStripePublishableKey() {
  const { publishableKey } = getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
