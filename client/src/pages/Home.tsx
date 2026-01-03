import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { BrandMarquee } from "@/components/BrandMarquee";
import { ProductCarousel } from "@/components/ProductCarousel";
import { FeatureHighlights } from "@/components/FeatureHighlights";
import { UseCases } from "@/components/UseCases";
import { Testimonials } from "@/components/Testimonials";
import { CTASection } from "@/components/CTASection";
import { LeadCapture } from "@/components/LeadCapture";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.filter((p) => p.isFeatured === 1) || [];
  const allProducts = products || [];

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <BrandMarquee />

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4" data-testid="text-showcase-title">
              Discover Master Library
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="text-showcase-subtitle">
              Over 1000 done-for-you digital products at your fingertips
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-products" />
            </div>
          ) : (
            <div className="space-y-8">
              {featuredProducts.length > 0 && (
                <ProductCarousel products={featuredProducts} direction="left" />
              )}
              {allProducts.length > 0 && (
                <ProductCarousel products={allProducts} direction="right" />
              )}
            </div>
          )}
        </div>
      </section>

      <FeatureHighlights />
      <UseCases />
      <Testimonials />
      <LeadCapture source="homepage" />
      <CTASection />
      <Footer />
    </div>
  );
}
