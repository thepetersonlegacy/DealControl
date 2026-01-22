import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { 
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, ArrowRight, 
  Zap, Star, Lock, FileCheck, Gift, Users, Download, Loader2
} from "lucide-react";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

// Countdown Timer for urgency
function UrgencyTimer({ seconds: initialSeconds }: { seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 300;

  return (
    <motion.div 
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}
      animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      <Clock className="w-5 h-5" />
      <span className="font-bold text-xl font-mono">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <span className="text-sm">to claim this price</span>
    </motion.div>
  );
}

function BenefitStack({ items }: { items: { text: string; value?: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div 
          key={i}
          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-foreground">{item.text}</span>
          </div>
          {item.value && (
            <span className="text-muted-foreground text-sm">{item.value}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Payment form component
function OfferPaymentForm({ 
  productId, 
  price, 
  onSuccess 
}: { 
  productId: string; 
  price: number; 
  onSuccess: (purchaseId: string, sessionId?: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!agreed) {
      toast({ title: "Required", description: "Please agree to the terms to continue.", variant: "destructive" });
      return;
    }

    if (!guestEmail) {
      toast({ title: "Required", description: "Please enter your email for delivery.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin },
        redirect: "if_required",
      });

      if (error) {
        toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        const response = await apiRequest("POST", "/api/confirm-purchase", {
          productId,
          paymentIntentId: paymentIntent.id,
          guestEmail,
        });
        const data = await response.json();
        
        // Start funnel session if available
        if (data.funnelSession) {
          onSuccess(data.purchaseId, data.funnelSession.id);
        } else {
          onSuccess(data.purchaseId);
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email for Delivery</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="your@email.com"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      
      <PaymentElement />
      
      <div className="flex items-start gap-2">
        <Checkbox id="terms" checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} />
        <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
          I agree to the <a href="/terms" className="underline">terms</a> and <a href="/legal/refunds" className="underline">refund policy</a>
        </Label>
      </div>
      
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full py-6 text-lg">
        {isProcessing ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>
        ) : (
          <><Lock className="w-5 h-5 mr-2" />Complete Purchase - ${(price / 100).toFixed(0)}</>
        )}
      </Button>
    </form>
  );
}

// Main Offer Page
export default function OfferPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Offer configuration - Transaction Risk Control Kit as tripwire
  const offerConfig = {
    'transaction-risk-kit': {
      title: "Transaction Risk Control Kit",
      headline: "Protect Every Deal From Costly Mistakes",
      subheadline: "The complete system top Texas agents use to eliminate transaction errors and close more deals",
      originalPrice: 49900,
      offerPrice: 4900,
      productId: null as string | null, // Will be fetched
      benefits: [
        { text: "12 Transaction Management SOPs", value: "$1,548 value" },
        { text: "8 Risk Prevention Checklists", value: "$1,032 value" },
        { text: "5 Negotiation Scripts", value: "$645 value" },
        { text: "Deal Timeline Tracker Template", value: "$297 value" },
        { text: "Deadline Alert System Guide", value: "$197 value" },
        { text: "Lifetime Updates Included", value: "Priceless" },
      ],
      guaranteeDays: 30,
      timerSeconds: 15 * 60, // 15 minutes
    }
  };

  const offer = offerConfig[offerId as keyof typeof offerConfig] || offerConfig['transaction-risk-kit'];

  // Fetch product by title to get ID
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const product = products?.find(p =>
    p.title.toLowerCase().includes('transaction risk') && p.tier === 'solo'
  ) || products?.find(p => p.isFeatured === 1);

  // Create payment intent
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("Product not found");
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        productId: product.id,
        priceOverride: offer.offerPrice,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (product && !clientSecret && !createPaymentMutation.isPending) {
      createPaymentMutation.mutate();
    }
  }, [product]);

  const handlePurchaseSuccess = (purchaseId: string, sessionId?: string) => {
    toast({ title: "Success!", description: "Your purchase is complete!" });
    if (sessionId) {
      navigate(`/funnel/${sessionId}`);
    } else {
      navigate(`/purchase-success?purchaseId=${purchaseId}`);
    }
  };

  const totalValue = offer.benefits.reduce((sum, b) => {
    const match = b.value?.match(/\$([0-9,]+)/);
    return sum + (match ? parseInt(match[1].replace(',', '')) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Urgency Header */}
      <div className="bg-destructive text-destructive-foreground py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">Special Offer Expires Soon!</span>
          <UrgencyTimer seconds={offer.timerSeconds} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Offer Details */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Social Proof */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
                </div>
                <span className="text-sm text-muted-foreground">Rated 4.9/5 by 2,847+ agents</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {offer.headline}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {offer.subheadline}
              </p>

              {/* Value Stack */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Everything Included:
                </h3>
                <BenefitStack items={offer.benefits} />
              </div>

              {/* Total Value */}
              <Card className="p-6 bg-primary/5 border-primary/20 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg">Total Value:</span>
                  <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg">Today's Price:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-muted-foreground line-through">
                      ${(offer.originalPrice / 100).toFixed(0)}
                    </span>
                    <span className="text-3xl font-bold text-primary">
                      ${(offer.offerPrice / 100).toFixed(0)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="inline-block bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    You Save ${((offer.originalPrice - offer.offerPrice) / 100).toFixed(0)} (90% OFF)
                  </span>
                </div>
              </Card>

              {/* Guarantee */}
              <div className="flex items-start gap-4 p-4 bg-green-500/10 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">{offer.guaranteeDays}-Day Money Back Guarantee</h4>
                  <p className="text-sm text-muted-foreground">
                    If this doesn't help you close more deals with confidence, get a full refund. No questions asked.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Payment */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 sticky top-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Complete Your Order</h3>
                  <p className="text-muted-foreground">Instant download after purchase</p>
                </div>

                {!stripePromise ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                    <p>Payment system is being configured.</p>
                  </div>
                ) : !clientSecret ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <OfferPaymentForm
                      productId={product?.id || ''}
                      price={offer.offerPrice}
                      onSuccess={handlePurchaseSuccess}
                    />
                  </Elements>
                )}

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center gap-1">
                      <Lock className="w-5 h-5" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Download className="w-5 h-5" />
                      <span>Instant Access</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="py-8 border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DealControl. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

