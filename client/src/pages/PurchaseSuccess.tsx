import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { Product, Purchase } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Calendar, CreditCard, Package } from "lucide-react";

interface PurchaseResponse {
  purchase: Purchase;
  product: Product;
  orderBumpPurchase: Purchase | null;
  orderBumpProduct: Product | null;
}

export default function PurchaseSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const purchaseId = searchParams.get('purchaseId');

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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" data-testid="icon-success" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-success-title">
              Purchase Successful!
            </h1>
            <p className="text-lg text-muted-foreground" data-testid="text-success-subtitle">
              Thank you for your purchase
            </p>
          </div>

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
            <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">You now have access to:</h3>
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
          )}

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

          <Card className="p-6 mt-6 bg-muted/50">
            <h3 className="font-semibold text-foreground mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• You'll receive a confirmation email with your purchase details</li>
              <li>• Access your purchased product{orderBumpProduct ? 's' : ''} anytime from your library</li>
              <li>• Download the product files and start using them immediately</li>
            </ul>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
