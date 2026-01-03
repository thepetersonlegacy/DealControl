import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, OrderBump as OrderBumpType } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { OrderBump, OrderBumpSkeleton } from "@/components/OrderBump";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface OrderBumpWithProduct extends OrderBumpType {
  bumpProduct: Product;
}

interface CheckoutFormProps {
  product: Product;
  paymentIntentId: string;
  totalAmount: number;
  orderBumpSelected: boolean;
  orderBump: OrderBumpWithProduct | null;
  onSuccess: (purchaseId: string) => void;
}

const CheckoutForm = ({ product, paymentIntentId, totalAmount, orderBumpSelected, orderBump, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        const response = await apiRequest("POST", "/api/confirm-purchase", {
          productId: product.id,
          paymentIntentId: paymentIntent.id,
          includeOrderBump: orderBumpSelected,
          orderBumpId: orderBump?.id,
        });
        
        const purchase = await response.json();
        
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        
        onSuccess(purchase.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred processing your payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
        data-testid="button-pay"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay ${(totalAmount / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [orderBumpSelected, setOrderBumpSelected] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get('productId');
  const selectedTier = searchParams.get('tier') || 'solo';
  const overridePrice = searchParams.get('price') ? parseInt(searchParams.get('price')!) : null;

  const tierLabels: Record<string, string> = {
    solo: 'Solo License',
    pro: 'Pro License', 
    office: 'Office License (Annual)',
  };

  const { data: orderBumpData, isLoading: isLoadingOrderBump } = useQuery<OrderBumpWithProduct | null>({
    queryKey: ['/api/order-bump', productId],
    enabled: !!productId,
  });

  useEffect(() => {
    if (!productId) {
      toast({
        title: "Error",
        description: "No product specified",
        variant: "destructive",
      });
      setLocation("/library");
      return;
    }

    const initCheckout = async () => {
      try {
        const includeOrderBump = orderBumpSelected && orderBumpData;
        
        const endpoint = includeOrderBump 
          ? "/api/checkout/with-bump" 
          : "/api/create-payment-intent";
        
        const body = includeOrderBump 
          ? { productId, includeOrderBump: true, tier: selectedTier, priceOverride: overridePrice }
          : { productId, tier: selectedTier, priceOverride: overridePrice };

        const res = await apiRequest("POST", endpoint, body);
        const data = await res.json();
        
        setClientSecret(data.clientSecret);
        setProduct(data.product);
        setTotalAmount(data.totalAmount || data.product.price);
        const intentId = data.clientSecret.split('_secret_')[0];
        setPaymentIntentId(intentId);
        setIsLoading(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to initialize checkout",
          variant: "destructive",
        });
        setLocation("/library");
      }
    };

    initCheckout();
  }, [productId, orderBumpSelected, orderBumpData]);

  const handleOrderBumpToggle = (selected: boolean) => {
    setOrderBumpSelected(selected);
    setIsLoading(true);
  };

  const handleSuccess = (purchaseId: string) => {
    setLocation(`/purchase-success?purchaseId=${purchaseId}`);
  };

  if (isLoading && !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-checkout" />
        </div>
      </div>
    );
  }

  if (!clientSecret || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-checkout-error">
              Unable to load checkout
            </h2>
            <Button asChild data-testid="button-back-to-library">
              <a href="/library">Back to Library</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8" data-testid="text-checkout-title">
            Complete Your Purchase
          </h1>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex gap-6">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-24 h-24 object-cover rounded-md"
                  data-testid="img-product"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-2" data-testid="text-product-title">
                    {product.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3" data-testid="text-product-description">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Format: {product.format}</span>
                      <span className="text-sm font-medium text-primary" data-testid="text-license-tier">
                        {tierLabels[selectedTier] || 'Solo License'}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-foreground" data-testid="text-product-price">
                      ${((overridePrice || product.price) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {isLoadingOrderBump && (
              <OrderBumpSkeleton />
            )}

            {!isLoadingOrderBump && orderBumpData && (
              <OrderBump
                orderBump={orderBumpData}
                isSelected={orderBumpSelected}
                onToggle={handleOrderBumpToggle}
                isLoading={isLoading}
              />
            )}

            {orderBumpSelected && orderBumpData && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center justify-between flex-wrap gap-4" data-testid="section-order-summary">
                  <span className="text-sm font-medium text-foreground">Order Summary</span>
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{product.title}</span>
                      <span>${(product.price / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-purple-600 dark:text-purple-400">
                      <span>{orderBumpData.bumpProduct.title}</span>
                      <span>+${(orderBumpData.bumpPrice / 100).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border mt-2 pt-2 flex items-center justify-end gap-4 font-bold text-foreground">
                      <span>Total</span>
                      <span data-testid="text-total-amount">${(totalAmount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Payment Details</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" data-testid="loader-payment" />
                </div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
                  <CheckoutForm 
                    product={product} 
                    paymentIntentId={paymentIntentId}
                    totalAmount={totalAmount}
                    orderBumpSelected={orderBumpSelected}
                    orderBump={orderBumpData || null}
                    onSuccess={handleSuccess} 
                  />
                </Elements>
              )}
            </Card>

            <p className="text-sm text-muted-foreground text-center" data-testid="text-secure-checkout">
              <Lock className="w-4 h-4 inline mr-1" />
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
