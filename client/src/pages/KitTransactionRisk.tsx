import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, FileCheck, AlertTriangle, BookOpen, CheckCircle, ArrowRight } from "lucide-react";

export default function KitTransactionRisk() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const transactionProducts = products?.filter(p => 
    p.category === "Transaction Control" || 
    p.category === "Estate/Probate"
  ).slice(0, 6) || [];

  const bundleProduct = products?.find(p => 
    p.tier === "bundle" && p.category === "Transaction Control"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Transaction Risk Control</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-kit-title">
              Stop Losing Deals to Preventable Mistakes
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-kit-subtitle">
              Professional SOPs, checklists, and scripts designed specifically for Texas real estate professionals who need systematic protection against transaction failures.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">What's Included</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Earnest Money Protection SOPs</span>
                    <p className="text-sm text-muted-foreground">Step-by-step procedures for handling earnest money disputes and deadline management.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Appraisal Gap Checklists</span>
                    <p className="text-sm text-muted-foreground">Systematic approach to handling appraisal shortfalls and renegotiation scenarios.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Financing Contingency Scripts</span>
                    <p className="text-sm text-muted-foreground">Communication templates for lender coordination and buyer qualification issues.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Title Clearance Playbooks</span>
                    <p className="text-sm text-muted-foreground">Procedures for identifying and resolving title issues before closing.</p>
                  </div>
                </li>
              </ul>
            </div>

            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">Choose Your License</h3>
              <div className="space-y-4 mb-6">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-foreground">Solo License</span>
                    <span className="text-2xl font-bold text-primary">$129</span>
                  </div>
                  <p className="text-sm text-muted-foreground">One-time purchase. Individual use only.</p>
                </div>
                <div className="border-2 border-primary rounded-lg p-4 relative">
                  <Badge className="absolute -top-2 right-4">Popular</Badge>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-foreground">Pro License</span>
                    <span className="text-2xl font-bold text-primary">$219</span>
                  </div>
                  <p className="text-sm text-muted-foreground">One-time purchase. Team use within one business.</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-foreground">Office License</span>
                    <span className="text-2xl font-bold text-primary">$699<span className="text-sm font-normal">/year</span></span>
                  </div>
                  <p className="text-sm text-muted-foreground">Annual license. Brokerage-wide internal use.</p>
                </div>
              </div>
              <Button asChild className="w-full" size="lg" data-testid="button-get-kit">
                <Link href="/library?filter=bundles">
                  <a className="flex items-center justify-center gap-2">
                    Get the Kit
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                All sales are final once files are accessed or downloaded.
              </p>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : transactionProducts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Featured Assets</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {transactionProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <a>
                      <Card className="overflow-hidden hover-elevate transition-all">
                        <div className="aspect-[4/3] relative">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <Badge variant="secondary" className="mb-2">{product.assetType}</Badge>
                          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{product.title}</h3>
                          <p className="text-sm text-primary font-medium">From ${((product.priceSolo || 12900) / 100).toFixed(0)}</p>
                        </div>
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h3 className="font-semibold text-foreground mb-3">Important Notice</h3>
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto" data-testid="text-kit-disclaimer">
              This material is provided for educational and operational support purposes only and does not constitute legal, financial, or tax advice. Users are responsible for compliance with all applicable local, state, and federal laws and for consulting appropriate licensed professionals when necessary.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
