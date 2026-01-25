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
import { Loader2, Lock, ShieldCheck, Clock, CheckCircle2, Download, AlertTriangle } from "lucide-react";
import { OrderBump, OrderBumpSkeleton } from "@/components/OrderBump";
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Check if Stripe is configured (for showing appropriate UI)
const stripeConfigured = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Urgency Timer Component
function CheckoutTimer() {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 300;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
      <Clock className="w-4 h-4" />
      <span className="font-mono font-semibold">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
      <span>price reserved</span>
    </div>
  );
}

interface OrderBumpWithProduct extends OrderBumpType {
  bumpProduct: Product;
}

interface CheckoutFormProps {
  product: Product;
  totalAmount: number;
  orderBumpSelected: boolean;
  orderBump: OrderBumpWithProduct | null;
  selectedTier: string;
}

const CheckoutForm = ({ product, totalAmount, orderBumpSelected, orderBump, selectedTier }: CheckoutFormProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address to receive your download link.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create Stripe Checkout Session with ToS acceptance
      const response = await apiRequest("POST", "/api/checkout/create-session", {
        productId: product.id,
        licenseType: selectedTier,
        guestEmail: email,
        orderBumpId: orderBumpSelected && orderBump ? orderBump.bumpProductId : undefined,
      });

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-testid="input-email"
        />
        <p className="text-xs text-muted-foreground">
          Your download link will be sent to this email
        </p>
      </div>

      <div className="bg-accent/10 p-4 rounded-md space-y-3 border border-accent/20">
        <h4 className="font-semibold text-sm text-foreground">What happens next?</h4>
        <ul className="text-xs text-muted-foreground leading-relaxed space-y-1">
          <li>• You'll be redirected to Stripe's secure checkout</li>
          <li>• You must accept our Terms of Service to complete payment</li>
          <li>• All sales are final for digital products</li>
          <li>• Download link sent immediately after payment</li>
        </ul>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing}
        data-testid="button-checkout"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to Checkout...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Continue to Secure Checkout - ${(totalAmount / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
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

  // Fetch product data
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

    const fetchProduct = async () => {
      try {
        const res = await apiRequest("GET", `/api/products/${productId}`);
        const productData = await res.json();
        setProduct(productData);

        // Calculate price based on tier
        const price = selectedTier === 'solo' ? productData.priceSolo :
                      selectedTier === 'pro' ? productData.pricePro :
                      productData.priceOffice;
        setTotalAmount(overridePrice || price || productData.price);
        setIsLoading(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load product",
          variant: "destructive",
        });
        setLocation("/library");
      }
    };

    fetchProduct();
  }, [productId, selectedTier, overridePrice, toast, setLocation]);

  // Update total when order bump is selected
  useEffect(() => {
    if (product && orderBumpData) {
      const basePrice = selectedTier === 'solo' ? product.priceSolo :
                        selectedTier === 'pro' ? product.pricePro :
                        product.priceOffice;
      const price = overridePrice || basePrice || product.price;

      if (orderBumpSelected) {
        setTotalAmount(price + orderBumpData.bumpPrice);
      } else {
        setTotalAmount(price);
      }
    }
  }, [orderBumpSelected, orderBumpData, product, selectedTier, overridePrice]);

  const handleOrderBumpToggle = (selected: boolean) => {
    setOrderBumpSelected(selected);
  };

  // Check if Stripe is configured - must be after all hooks
  if (!stripeConfigured) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-xl font-bold mb-4">Checkout Unavailable</h1>
          <p className="text-gray-400">Payment processing is not configured. Please contact support.</p>
        </Card>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-checkout" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Urgency Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 mt-16">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 flex-wrap text-sm">
          <CheckoutTimer />
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center gap-2 text-green-600">
            <ShieldCheck className="w-4 h-4" />
            <span>30-Day Money Back Guarantee</span>
          </div>
        </div>
      </div>

      <main className="flex-1 pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-checkout-title">
              Complete Your Purchase
            </h1>
            <p className="text-muted-foreground mb-8">Secure checkout • Instant download after payment</p>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
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
            </motion.div>

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
              <h3 className="text-lg font-semibold text-foreground mb-4">Enter Your Email</h3>
              <CheckoutForm
                product={product}
                totalAmount={totalAmount}
                orderBumpSelected={orderBumpSelected}
                orderBump={orderBumpData || null}
                selectedTier={selectedTier}
              />
            </Card>

            {/* Trust Badges */}
            <motion.div
              className="grid grid-cols-4 gap-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { icon: Lock, label: "256-bit SSL" },
                { icon: ShieldCheck, label: "Secure Checkout" },
                { icon: Download, label: "Instant Access" },
                { icon: CheckCircle2, label: "30-Day Guarantee" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center text-xs text-muted-foreground">
                  <item.icon className="w-5 h-5 mb-1" />
                  <span>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
