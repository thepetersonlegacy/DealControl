import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Loader2, Search } from "lucide-react";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('filter');
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter');
    if (filter === 'bundles') {
      setSelectedCategory('Bundles');
    } else if (filter === 'sops') {
      setSelectedCategory('SOPs');
    } else {
      setSelectedCategory(null);
    }
  }, [window.location.search]);

  const categories = Array.from(
    new Set(products?.map((p) => p.category) || [])
  );

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-library-title">
              Master Library
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-library-subtitle">
              Browse our complete collection
            </p>
          </div>

          <div className="mb-8 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                data-testid="button-category-all"
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-library" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-xl text-muted-foreground" data-testid="text-no-results">
                No products found. Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground" data-testid="text-results-count">
                  Showing {filteredProducts.length} products
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <a data-testid={`link-product-${product.id}`}>
                      <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all hover:scale-105">
                        <div className="aspect-[3/4] relative">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            data-testid={`img-library-product-${product.id}`}
                          />
                        </div>
                        <div className="p-4">
                          <Badge variant="secondary" className="mb-2" data-testid={`badge-category-${product.id}`}>
                            {product.category}
                          </Badge>
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2" data-testid={`text-library-title-${product.id}`}>
                            {product.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid={`text-library-description-${product.id}`}>
                            {product.description}
                          </p>
                          <p className="text-lg font-bold text-primary" data-testid={`text-library-price-${product.id}`}>
                            ${(product.price / 100).toFixed(2)}
                          </p>
                        </div>
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
