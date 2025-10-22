import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import type { Product } from "@shared/schema";
import { Link } from "wouter";

interface ProductCarouselProps {
  products: Product[];
  direction?: "left" | "right";
}

export function ProductCarousel({ products, direction = "left" }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    const scrollSpeed = direction === "left" ? 1 : -1;
    let animationFrameId: number;

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;

        if (direction === "left" && scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        } else if (direction === "right" && scrollContainer.scrollLeft <= 0) {
          scrollContainer.scrollLeft = scrollContainer.scrollWidth / 2;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [direction, isPaused]);

  const duplicatedProducts = [...products, ...products];

  return (
    <div 
      ref={scrollRef}
      className="flex gap-6 overflow-x-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {duplicatedProducts.map((product, index) => (
        <Link key={`${product.id}-${index}`} href={`/product/${product.id}`}>
          <a data-testid={`card-product-${product.id}-${index}`}>
            <Card className="flex-shrink-0 w-64 overflow-hidden hover-elevate active-elevate-2 transition-all hover:scale-105">
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  data-testid={`img-product-${product.id}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-6">
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-1" data-testid={`text-product-title-${product.id}`}>
                      {product.title}
                    </h3>
                    <p className="text-muted-foreground text-sm" data-testid={`text-product-category-${product.id}`}>
                      {product.category}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </a>
        </Link>
      ))}
    </div>
  );
}
