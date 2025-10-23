import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import type { Product } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Download, CheckCircle } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      return response.json();
    },
  });

  const features = [
    "Private Label Rights - Full ownership",
    "Editable source files included",
    "Commercial use allowed",
    "No attribution required",
    "Lifetime access to content",
    "Free updates and improvements",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-product-detail" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-product-not-found">
              Product Not Found
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="outline" className="mb-8" data-testid="button-back">
            <Link href="/library">
              <a className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Library
              </a>
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Card className="overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full aspect-[3/4] object-cover"
                  data-testid="img-product-detail"
                />
              </Card>
            </div>

            <div>
              <Badge variant="secondary" className="mb-4" data-testid="badge-product-category">
                {product.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-product-detail-title">
                {product.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6" data-testid="text-product-detail-description">
                {product.description}
              </p>

              <div className="mb-8">
                <p className="text-4xl font-bold text-primary mb-2" data-testid="text-product-price">
                  ${(product.price / 100).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground" data-testid="text-one-time-payment">
                  One-time payment • Lifetime access
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <Button asChild size="lg" className="w-full text-lg py-6" data-testid="button-purchase">
                  <Link href={`/checkout?productId=${product.id}`}>
                    <a>
                      <Download className="w-5 h-5 mr-2" />
                      Purchase & Download
                    </a>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full text-lg py-6" data-testid="button-learn-more">
                  <Link href="/library">
                    <a>Browse More Products</a>
                  </Link>
                </Button>
              </div>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4" data-testid="text-whats-included">
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3" data-testid={`list-item-feature-${index}`}>
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
