import Stripe from 'stripe';
import { getUncachableStripeClient, getStripeSecretKey } from './stripeClient';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const stripe = await getUncachableStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
      // Parse the event without verification (not recommended for production)
      const event = JSON.parse(payload.toString()) as Stripe.Event;
      await WebhookHandlers.handleEvent(event);
      return;
    }

    // Verify and construct the event
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    await WebhookHandlers.handleEvent(event);
  }

  static async handleEvent(event: Stripe.Event): Promise<void> {
    console.log(`Processing Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Checkout session completed:', event.data.object);
        // Handle successful checkout
        break;
      case 'payment_intent.succeeded':
        console.log('Payment intent succeeded:', event.data.object);
        // Handle successful payment
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment intent failed:', event.data.object);
        // Handle failed payment
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log('Subscription event:', event.type, event.data.object);
        // Handle subscription changes
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
