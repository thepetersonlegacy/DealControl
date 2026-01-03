import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { FunnelStep, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Check, Clock, Sparkles, ShieldCheck, Zap, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface NextStepResponse {
  step: FunnelStep | null;
  product: Product | null;
  isLastStep: boolean;
}

interface RespondResponse {
  clientSecret?: string;
  product?: Product;
  price?: number;
  nextStep?: { product: Product } & FunnelStep;
  isLastStep?: boolean;
  completed?: boolean;
}

function CountdownTimer({ seconds, onExpire }: { seconds: number; onExpire?: () => void }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const isUrgent = timeLeft < 60;

  return (
    <motion.div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        isUrgent 
          ? 'bg-destructive/10 text-destructive' 
          : 'bg-primary/10 text-primary'
      }`}
      animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
      data-testid="countdown-timer"
    >
      <Clock className="w-5 h-5" />
      <span className="font-semibold text-lg" data-testid="text-countdown-value">
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <span className="text-sm opacity-80">left</span>
    </motion.div>
  );
}

function PaymentForm({ 
  onSuccess, 
  onCancel,
  sessionId,
  stepId 
}: { 
  onSuccess: () => void; 
  onCancel: () => void;
  sessionId: string;
  stepId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        await apiRequest('POST', `/api/funnel/session/${sessionId}/complete-step`, {
          stepId,
          paymentIntentId: paymentIntent.id,
        });
        toast({
          title: "Success!",
          description: "Your order has been added.",
        });
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Payment processing failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1"
            data-testid="button-confirm-payment"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            data-testid="button-cancel-payment"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <motion.div 
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
        <Check className="w-4 h-4 text-primary" />
      </div>
      <span className="text-foreground">{text}</span>
    </motion.div>
  );
}

export default function FunnelOffer() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [localStep, setLocalStep] = useState<{ step: FunnelStep; product: Product; isLastStep: boolean } | null>(null);
  const currentStepIdRef = useRef<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery<NextStepResponse>({
    queryKey: ['/api/funnel/session', sessionId, 'next'],
    enabled: !!sessionId,
  });

  // Sync query data to local state when it loads
  useEffect(() => {
    if (data?.step && data?.product) {
      setLocalStep({ step: data.step, product: data.product, isLastStep: data.isLastStep });
      currentStepIdRef.current = data.step.id;
    }
  }, [data]);

  const respondMutation = useMutation({
    mutationFn: async ({ stepId, accepted }: { stepId: string; accepted: boolean }) => {
      const response = await apiRequest('POST', `/api/funnel/session/${sessionId}/respond`, {
        stepId,
        accepted,
      });
      return response.json() as Promise<RespondResponse>;
    },
    onSuccess: (result) => {
      if (result.completed) {
        toast({
          title: "Thank you!",
          description: "Your order is complete.",
        });
        navigate('/library');
        return;
      }

      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setCurrentPrice(result.price || null);
        setShowPayment(true);
      } else if (result.nextStep) {
        // Reset payment flags first before processing next step
        setShowPayment(false);
        setClientSecret(null);
        setCurrentPrice(null);
        // Update local state with the next step from the response
        const nextProduct = result.nextStep.product as unknown as Product;
        setLocalStep({
          step: result.nextStep as unknown as FunnelStep,
          product: nextProduct,
          isLastStep: result.isLastStep ?? false,
        });
        currentStepIdRef.current = result.nextStep.id;
      }
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleAccept = useCallback(() => {
    if (currentStepIdRef.current) {
      respondMutation.mutate({ stepId: currentStepIdRef.current, accepted: true });
    }
  }, [respondMutation]);

  const handleDecline = useCallback(() => {
    if (currentStepIdRef.current) {
      respondMutation.mutate({ stepId: currentStepIdRef.current, accepted: false });
    }
  }, [respondMutation]);

  const handlePaymentSuccess = useCallback(() => {
    setShowPayment(false);
    setClientSecret(null);
    queryClient.invalidateQueries({ queryKey: ['/api/funnel/session', sessionId, 'next'] });
    refetch();
  }, [sessionId, refetch]);

  const handlePaymentCancel = useCallback(() => {
    setShowPayment(false);
    setClientSecret(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-funnel" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-funnel-error">
          Session Not Found
        </h2>
        <Button onClick={() => navigate('/library')} data-testid="button-back-to-library">
          Back to Library
        </Button>
      </div>
    );
  }

  if (!localStep) {
    if (!data?.step || !data?.product) {
      navigate('/library');
      return null;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const { step, product, isLastStep } = localStep;
  const price = step.priceOverride ?? product.price;
  const originalPrice = product.price > price ? product.price : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const benefits = [
    "Instant digital delivery",
    "Lifetime access included",
    "Money-back guarantee",
    step.stepType === 'upsell' ? "Premium bonus content" : "Exclusive discount pricing",
    "Works on all devices",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-8">
              {step.stepType === 'upsell' && (
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Special One-Time Offer</span>
                </motion.div>
              )}
              {step.stepType === 'downsell' && (
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-medium">Wait! Here's a Better Deal</span>
                </motion.div>
              )}
              
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                data-testid="text-offer-headline"
              >
                {step.headline || `Add ${product.title} to Your Order?`}
              </motion.h1>
              
              {step.subheadline && (
                <motion.p 
                  className="text-lg text-muted-foreground max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  data-testid="text-offer-subheadline"
                >
                  {step.subheadline}
                </motion.p>
              )}
            </div>

            {step.timerSeconds && step.timerSeconds > 0 && (
              <motion.div 
                className="flex justify-center mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CountdownTimer 
                  seconds={step.timerSeconds} 
                  onExpire={handleDecline}
                />
              </motion.div>
            )}

            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <motion.div 
                  className="relative aspect-square md:aspect-auto"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    data-testid="img-offer-product"
                  />
                  {discount > 0 && (
                    <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
                      {discount}% OFF
                    </div>
                  )}
                </motion.div>

                <div className="p-6 md:p-8 flex flex-col">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-product-title">
                      {product.title}
                    </h2>
                    <p className="text-muted-foreground mb-6" data-testid="text-product-description">
                      {product.description}
                    </p>
                  </motion.div>

                  <motion.div 
                    className="flex items-baseline gap-3 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <span className="text-4xl font-bold text-foreground" data-testid="text-offer-price">
                      ${(price / 100).toFixed(2)}
                    </span>
                    {originalPrice && (
                      <span className="text-xl text-muted-foreground line-through" data-testid="text-original-price">
                        ${(originalPrice / 100).toFixed(2)}
                      </span>
                    )}
                  </motion.div>

                  <motion.div 
                    className="space-y-3 mb-8 flex-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {benefits.map((benefit, index) => (
                      <BenefitItem key={index} text={benefit} />
                    ))}
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {showPayment && clientSecret ? (
                      <Elements 
                        stripe={stripePromise} 
                        options={{ clientSecret }}
                      >
                        <PaymentForm
                          onSuccess={handlePaymentSuccess}
                          onCancel={handlePaymentCancel}
                          sessionId={sessionId!}
                          stepId={step.id}
                        />
                      </Elements>
                    ) : (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Button
                          onClick={handleAccept}
                          disabled={respondMutation.isPending}
                          className="w-full py-6 text-lg font-semibold"
                          data-testid="button-accept-offer"
                        >
                          {respondMutation.isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-2" />
                              {step.ctaText || "Yes! Add This To My Order"}
                            </>
                          )}
                        </Button>

                        <button
                          onClick={handleDecline}
                          disabled={respondMutation.isPending}
                          className="w-full text-center py-3 text-muted-foreground hover:text-foreground transition-colors text-sm underline underline-offset-4"
                          data-testid="button-decline-offer"
                        >
                          {step.declineText || "No thanks, I'll pass on this offer"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Card>

            <motion.div 
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-muted-foreground text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span>Secure 256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span>30-Day Money Back Guarantee</span>
              </div>
            </motion.div>

            {!isLastStep && (
              <motion.p 
                className="text-center text-sm text-muted-foreground mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                data-testid="text-more-offers"
              >
                More exclusive offers available after this step
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
