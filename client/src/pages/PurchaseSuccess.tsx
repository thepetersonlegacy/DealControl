import { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import type { Product, Purchase, FunnelSession } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Calendar, CreditCard, Package, Download, ArrowRight, Star, Zap, Gift, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import confetti from 'canvas-confetti';

interface PurchaseResponse {
  purchase: Purchase;
  product: Product;
  orderBumpPurchase: Purchase | null;
  orderBumpProduct: Product | null;
}

interface FunnelStartResponse {
  funnelSession: FunnelSession | null;
  hasNextStep: boolean;
}

export default function PurchaseSuccess() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const purchaseId = searchParams.get('purchaseId');
  const [funnelChecked, setFunnelChecked] = useState(false);
  const funnelStartedRef = useRef(false);

  const { data, isLoading, error } = useQuery<PurchaseResponse>({
    queryKey: ["/api/purchases", purchaseId],
    queryFn: async () => {
      if (!purchaseId) {
        throw new Error("No purchase ID provided");
      }
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Purchase not found");
      }
      return response.json();
    },
    enabled: !!purchaseId,
  });

  const startFunnelMutation = useMutation({
    mutationFn: async ({ purchaseId, productId }: { purchaseId: string; productId: string }) => {
      const response = await apiRequest('POST', '/api/funnel/start', { purchaseId, productId });
      return response.json() as Promise<FunnelStartResponse>;
    },
    onSuccess: (result) => {
      setFunnelChecked(true);
      if (result.funnelSession && result.hasNextStep) {
        setTimeout(() => {
          navigate(`/funnel/${result.funnelSession!.id}`);
        }, 2000);
      }
    },
    onError: () => {
      setFunnelChecked(true);
    },
  });

  // Trigger confetti on successful purchase
  const confettiTriggeredRef = useRef(false);
  useEffect(() => {
    if (data && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;
      // Fire confetti celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#3b82f6', '#a855f7']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#3b82f6', '#a855f7']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [data]);

  useEffect(() => {
    if (data && !funnelStartedRef.current) {
      funnelStartedRef.current = true;

      // Check if user should see OTO (first purchase and haven't seen OTO)
      const hasSeenOTO = sessionStorage.getItem('oto_seen');
      const purchaseCount = sessionStorage.getItem('purchase_count') || '0';
      const newCount = parseInt(purchaseCount) + 1;
      sessionStorage.setItem('purchase_count', newCount.toString());

      // Show OTO after first purchase if they haven't seen it
      if (newCount === 1 && !hasSeenOTO) {
        setTimeout(() => {
          navigate('/oto');
        }, 3000); // Show success briefly, then redirect to OTO
        return;
      }

      // Otherwise, try regular funnel
      startFunnelMutation.mutate({
        purchaseId: data.purchase.id,
        productId: data.product.id,
      });
    }
  }, [data, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-purchase-success" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-purchase-error">
              Purchase Not Found
            </h2>
            <Button asChild data-testid="button-back-to-library">
              <Link href="/library">
                <a>Back to Library</a>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { purchase, product, orderBumpPurchase, orderBumpProduct } = data;
  const purchaseDate = new Date(purchase.purchasedAt * 1000);
  const totalAmount = purchase.amount + (orderBumpPurchase?.amount || 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" data-testid="icon-success" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-success-title">
              🎉 Purchase Successful!
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-success-subtitle">
              Thank you for your purchase. Your transaction has been completed.
            </p>
          </motion.div>

          {/* Download Section - Priority */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1 text-xl">🚀 Your files are ready!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click below to download your purchase. These materials are licensed for internal use only.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg" className="gap-2" data-testid="button-download-main">
                      <a href={`/api/download/${purchase.id}`} download>
                        <Download className="w-4 h-4" />
                        Download {product.title}
                      </a>
                    </Button>
                    {orderBumpPurchase && orderBumpProduct && (
                      <Button asChild variant="outline" size="lg" className="gap-2" data-testid="button-download-bump">
                        <a href={`/api/download/${orderBumpPurchase.id}`} download>
                          <Gift className="w-4 h-4" />
                          Download {orderBumpProduct.title}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-24 h-24 object-cover rounded-md"
                  data-testid="img-product"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1" data-testid="text-product-title">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2" data-testid="text-product-format">
                    {product.format}
                  </p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-product-price">
                    ${(purchase.amount / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {orderBumpPurchase && orderBumpProduct && (
                <div className="flex gap-4 pt-4 border-t">
                  <img
                    src={orderBumpProduct.imageUrl}
                    alt={orderBumpProduct.title}
                    className="w-24 h-24 object-cover rounded-md"
                    data-testid="img-order-bump-product"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary uppercase">Bonus Item</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1" data-testid="text-order-bump-title">
                      {orderBumpProduct.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2" data-testid="text-order-bump-format">
                      {orderBumpProduct.format}
                    </p>
                    <p className="text-sm font-medium text-foreground" data-testid="text-order-bump-price">
                      ${(orderBumpPurchase.amount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Total Amount Paid</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground" data-testid="text-amount-paid">
                    ${(totalAmount / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Purchase Date</span>
                  </div>
                  <span className="text-sm text-foreground" data-testid="text-purchase-date">
                    {purchaseDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="text-sm font-mono text-foreground" data-testid="text-transaction-id">
                    {purchase.id}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {orderBumpProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  You now have access to:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span data-testid="text-access-main-product">{product.title}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span data-testid="text-access-bump-product">{orderBumpProduct.title}</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          )}

          {/* Special Upsell CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 mb-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">EXCLUSIVE OFFER</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Level Up Your Real Estate Business
              </h3>
              <p className="text-muted-foreground mb-4">
                Unlock our complete toolkit and get everything you need to close more deals, protect more transactions, and grow your revenue.
              </p>
              <Button asChild className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                <Link href="/library">
                  <a className="flex items-center gap-2">
                    Browse Complete Collection <ArrowRight className="w-4 h-4" />
                  </a>
                </Link>
              </Button>
            </Card>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1" data-testid="button-view-purchases">
              <Link href="/library">
                <a>View My Purchases</a>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" data-testid="button-browse-more">
              <Link href="/library">
                <a>Browse More Products</a>
              </Link>
            </Button>
          </div>

          {/* Trust & What's Next Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6 mt-6 bg-muted/50">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                What's Next?
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>You'll receive a confirmation email with your purchase details</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Access your purchased product{orderBumpProduct ? 's' : ''} anytime from your library</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Download and start implementing these strategies today</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Join our community of 10,000+ successful real estate professionals</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
