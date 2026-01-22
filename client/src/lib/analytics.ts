/**
 * Analytics and Conversion Tracking Utilities
 * Tracks funnel steps, page views, and conversions
 */

export type FunnelEventType = 
  | 'page_view'
  | 'landing_page_view'
  | 'offer_page_view'
  | 'checkout_started'
  | 'order_bump_added'
  | 'order_bump_removed'
  | 'payment_initiated'
  | 'purchase_completed'
  | 'upsell_viewed'
  | 'upsell_accepted'
  | 'upsell_declined'
  | 'downsell_viewed'
  | 'downsell_accepted'
  | 'downsell_declined'
  | 'exit_intent_triggered'
  | 'exit_intent_converted'
  | 'email_captured';

export interface FunnelEvent {
  type: FunnelEventType;
  timestamp: number;
  sessionId?: string;
  productId?: string;
  productTitle?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

// Generate or retrieve session ID
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('funnel_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('funnel_session_id', sessionId);
  }
  return sessionId;
}

// Get visitor ID (persisted across sessions)
export function getVisitorId(): string {
  let visitorId = localStorage.getItem('funnel_visitor_id');
  if (!visitorId) {
    visitorId = `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('funnel_visitor_id', visitorId);
  }
  return visitorId;
}

// Track an event
export function trackEvent(event: Omit<FunnelEvent, 'timestamp' | 'sessionId'>): void {
  const fullEvent: FunnelEvent = {
    ...event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  // Store events in session storage
  const events = getStoredEvents();
  events.push(fullEvent);
  sessionStorage.setItem('funnel_events', JSON.stringify(events));

  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', fullEvent.type, fullEvent);
  }

  // Send to backend (if configured)
  sendEventToBackend(fullEvent).catch(console.error);
}

// Get stored events
export function getStoredEvents(): FunnelEvent[] {
  try {
    const stored = sessionStorage.getItem('funnel_events');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Clear stored events
export function clearStoredEvents(): void {
  sessionStorage.removeItem('funnel_events');
}

// Send event to backend
async function sendEventToBackend(event: FunnelEvent): Promise<void> {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        visitorId: getVisitorId(),
      }),
    });
  } catch {
    // Silently fail - analytics should not block user experience
  }
}

// Convenience functions for common events
export const analytics = {
  trackPageView: (page: string) => trackEvent({ type: 'page_view', metadata: { page } }),
  
  trackLandingView: () => trackEvent({ type: 'landing_page_view' }),
  
  trackOfferView: (productId: string, productTitle: string) => 
    trackEvent({ type: 'offer_page_view', productId, productTitle }),
  
  trackCheckoutStarted: (productId: string, value: number) => 
    trackEvent({ type: 'checkout_started', productId, value }),
  
  trackOrderBumpAdded: (productId: string, value: number) => 
    trackEvent({ type: 'order_bump_added', productId, value }),
  
  trackOrderBumpRemoved: (productId: string) => 
    trackEvent({ type: 'order_bump_removed', productId }),
  
  trackPaymentInitiated: (productId: string, value: number) => 
    trackEvent({ type: 'payment_initiated', productId, value }),
  
  trackPurchaseCompleted: (productId: string, value: number, productTitle?: string) => 
    trackEvent({ type: 'purchase_completed', productId, value, productTitle }),
  
  trackUpsellViewed: (productId: string, productTitle: string) => 
    trackEvent({ type: 'upsell_viewed', productId, productTitle }),
  
  trackUpsellAccepted: (productId: string, value: number) => 
    trackEvent({ type: 'upsell_accepted', productId, value }),
  
  trackUpsellDeclined: (productId: string) => 
    trackEvent({ type: 'upsell_declined', productId }),
  
  trackExitIntentTriggered: () => trackEvent({ type: 'exit_intent_triggered' }),
  
  trackExitIntentConverted: (email?: string) => 
    trackEvent({ type: 'exit_intent_converted', metadata: { email: !!email } }),
  
  trackEmailCaptured: (source: string) => 
    trackEvent({ type: 'email_captured', metadata: { source } }),
};

export default analytics;

