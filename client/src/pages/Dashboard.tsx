import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Download, ShoppingBag, Clock, Package, FileDown, AlertCircle } from "lucide-react";
import type { Purchase, Product, Download as DownloadType, User } from "@shared/schema";

interface PurchaseWithProduct {
  purchase: Purchase;
  product: Product | null;
}

interface DownloadWithDetails {
  download: DownloadType;
  purchase: Purchase;
  product: Product | null;
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function PurchasesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} data-testid={`skeleton-purchase-${i}`}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="w-20 h-28 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-9 w-24 mt-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DownloadsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg" data-testid={`skeleton-download-${i}`}>
          <Skeleton className="w-10 h-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof ShoppingBag; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user: rawUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const user = rawUser as User | undefined;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: purchases, isLoading: purchasesLoading, error: purchasesError } = useQuery<PurchaseWithProduct[]>({
    queryKey: ["/api/user/purchases"],
    enabled: isAuthenticated,
  });

  const { data: downloads, isLoading: downloadsLoading, error: downloadsError } = useQuery<DownloadWithDetails[]>({
    queryKey: ["/api/user/downloads"],
    enabled: isAuthenticated,
  });

  const downloadMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const response = await apiRequest("GET", `/api/user/purchases/${purchaseId}/download`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/downloads"] });
      window.open(data.downloadUrl, '_blank');
      toast({
        title: "Download started",
        description: `Your download for "${data.product.title}" is ready.`,
      });
    },
    onError: () => {
      toast({
        title: "Download failed",
        description: "There was an error starting your download. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-10 w-48 mb-8" />
            <PurchasesSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4" data-testid="text-login-required">Login Required</h1>
            <p className="text-muted-foreground mb-6">Please log in to view your purchases and downloads.</p>
            <Button
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-dashboard"
            >
              Log In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">My Dashboard</h1>
            <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! Manage your purchases and downloads here.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold" data-testid="text-purchases-title">Purchase History</h2>
                </div>

                {purchasesLoading ? (
                  <PurchasesSkeleton />
                ) : purchasesError ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
                      <p className="text-destructive" data-testid="text-purchases-error">Failed to load purchases</p>
                    </CardContent>
                  </Card>
                ) : !purchases || purchases.length === 0 ? (
                  <Card>
                    <CardContent>
                      <EmptyState
                        icon={ShoppingBag}
                        title="No purchases yet"
                        description="Browse our library to find digital products that will help you grow."
                      />
                      <div className="text-center mt-4">
                        <Button onClick={() => setLocation("/library")} data-testid="button-browse-library">
                          Browse Library
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {purchases.map(({ purchase, product }) => (
                      <Card key={purchase.id} data-testid={`card-purchase-${purchase.id}`}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {product?.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-20 h-28 object-cover rounded-md"
                                data-testid={`img-purchase-product-${purchase.id}`}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm leading-tight mb-1 truncate" data-testid={`text-purchase-title-${purchase.id}`}>
                                {product?.title || "Unknown Product"}
                              </h3>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {product?.format || "Digital"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                <Clock className="w-3 h-3" />
                                <span data-testid={`text-purchase-date-${purchase.id}`}>{formatDate(purchase.purchasedAt)}</span>
                              </div>
                              <p className="text-sm font-semibold text-primary mb-3" data-testid={`text-purchase-amount-${purchase.id}`}>
                                {formatPrice(purchase.amount)}
                              </p>
                              <Button
                                size="sm"
                                onClick={() => downloadMutation.mutate(purchase.id)}
                                disabled={downloadMutation.isPending}
                                data-testid={`button-download-${purchase.id}`}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {downloadMutation.isPending ? "Starting..." : "Download"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileDown className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold" data-testid="text-downloads-title">Download History</h2>
                </div>

                <Card>
                  <CardContent className="p-4">
                    {downloadsLoading ? (
                      <DownloadsSkeleton />
                    ) : downloadsError ? (
                      <div className="py-8 text-center">
                        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
                        <p className="text-destructive" data-testid="text-downloads-error">Failed to load downloads</p>
                      </div>
                    ) : !downloads || downloads.length === 0 ? (
                      <EmptyState
                        icon={FileDown}
                        title="No downloads yet"
                        description="Download your purchased products to see them here."
                      />
                    ) : (
                      <div className="space-y-3">
                        {downloads.map(({ download, product }) => (
                          <div
                            key={download.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                            data-testid={`row-download-${download.id}`}
                          >
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                              <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" data-testid={`text-download-title-${download.id}`}>
                                {product?.title || "Deleted Product"}
                              </p>
                              <p className="text-xs text-muted-foreground" data-testid={`text-download-date-${download.id}`}>
                                Downloaded {formatDate(download.downloadedAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary" data-testid="text-stat-purchases">
                        {purchases?.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Purchases</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary" data-testid="text-stat-downloads">
                        {downloads?.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Downloads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
