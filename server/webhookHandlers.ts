import Stripe from 'stripe';
import { getUncachableStripeClient, getStripeSecretKey } from './stripeClient';
import { storage } from './storage';
import { sendPurchaseConfirmationEmail } from './emailService';
import * as crypto from 'crypto';

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
        await WebhookHandlers.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        console.log('Payment intent succeeded:', event.data.object);
        await WebhookHandlers.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment intent failed:', event.data.object);
        await WebhookHandlers.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log('Subscription event:', event.type, event.data.object);
        // Handle subscription changes if needed
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    try {
      // This is called when a Stripe Checkout session completes
      // Most of our logic is in the payment_intent.succeeded handler
      // but we can use this for additional logging or Checkout-specific features
      console.log('Checkout session completed for:', session.customer_email || session.customer);
    } catch (error) {
      console.error('Error handling checkout session completed:', error);
    }
  }

  static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const paymentIntentId = paymentIntent.id;

      // Check if we already have a purchase for this payment
      const existingPurchase = await storage.getPurchaseByStripePaymentId(paymentIntentId);

      if (!existingPurchase) {
        // Purchase not yet created - this might happen if webhook fires before confirm-purchase
        // The confirm-purchase endpoint will handle this case
        console.log('Purchase not found for payment intent:', paymentIntentId);
        return;
      }

      // Check if we already created an access token for this purchase
      const existingToken = await storage.getAccessTokenByPurchaseId(existingPurchase.id);

      if (existingToken) {
        console.log('Access token already exists for purchase:', existingPurchase.id);
        return;
      }

      // Get the product for this purchase
      const product = await storage.getProduct(existingPurchase.productId);
      if (!product) {
        console.error('Product not found for purchase:', existingPurchase.productId);
        return;
      }

      // Generate access token if not already done
      const tokenValue = crypto.randomBytes(32).toString('hex');
      const licenseType = product.tier || 'solo';

      const accessToken = await storage.createAccessToken({
        token: tokenValue,
        purchaseId: existingPurchase.id,
        userId: existingPurchase.userId || undefined,
        licenseType: licenseType,
      });

      console.log('Created access token via webhook for purchase:', existingPurchase.id);

      // Send confirmation email if we have an email
      const customerEmail = existingPurchase.guestEmail ||
        (existingPurchase.userId ? (await storage.getUser(existingPurchase.userId))?.email : null);

      if (customerEmail) {
        await sendPurchaseConfirmationEmail(
          customerEmail,
          existingPurchase,
          product,
          tokenValue,
          null // No order bump info from webhook
        );
        console.log('Sent confirmation email via webhook to:', customerEmail);
      }
    } catch (error) {
      console.error('Error handling payment intent succeeded:', error);
    }
  }

  static async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      console.log('Payment failed for intent:', paymentIntent.id);
      console.log('Failure reason:', paymentIntent.last_payment_error?.message);

      // Log the failure for analytics/debugging
      // Could also send notification email here if desired
    } catch (error) {
      console.error('Error handling payment intent failed:', error);
    }
  }
}
