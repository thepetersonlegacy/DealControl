import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  product: Product;
  paymentIntentId: string;
  onSuccess: (purchaseId: string) => void;
}

const CheckoutForm = ({ product, paymentIntentId, onSuccess }: CheckoutFormProps) => {
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
            Pay ${(product.price / 100).toFixed(2)}
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

  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get('productId');

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

    apiRequest("POST", "/api/create-payment-intent", { productId })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setProduct(data.product);
        const intentId = data.clientSecret.split('_secret_')[0];
        setPaymentIntentId(intentId);
        setIsLoading(false);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to initialize checkout",
          variant: "destructive",
        });
        setLocation("/library");
      });
  }, [productId]);

  const handleSuccess = (purchaseId: string) => {
    setLocation(`/purchase-success?purchaseId=${purchaseId}`);
  };

  if (isLoading) {
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Format: {product.format}</span>
                    <span className="text-2xl font-bold text-foreground" data-testid="text-product-price">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Payment Details</h3>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  product={product} 
                  paymentIntentId={paymentIntentId}
                  onSuccess={handleSuccess} 
                />
              </Elements>
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
