import Stripe from 'stripe';

// Get Stripe credentials from environment variables
function getCredentials() {
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
