import { useEffect, useRef, useState } from "react";

const brandLogos = [
  { name: "TechCorp", width: 120 },
  { name: "InnovateCo", width: 140 },
  { name: "DigitalPro", width: 130 },
  { name: "CreativeHub", width: 150 },
  { name: "MarketMasters", width: 160 },
  { name: "GrowthLab", width: 110 },
  { name: "ContentKing", width: 145 },
  { name: "BusinessPro", width: 135 },
];

export function BrandMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationFrameId: number;

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 1;

        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const duplicatedBrands = [...brandLogos, ...brandLogos, ...brandLogos];

  return (
    <section className="py-12 border-y bg-background overflow-hidden">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide" data-testid="text-brands-title">
          Trusted by top brands and individuals worldwide
        </p>
      </div>
      <div 
        ref={scrollRef}
        className="flex gap-12 overflow-x-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedBrands.map((brand, index) => (
          <div
            key={`${brand.name}-${index}`}
            className="flex-shrink-0 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
            style={{ width: `${brand.width}px` }}
            data-testid={`brand-logo-${index}`}
          >
            <div className="text-2xl font-bold text-foreground">
              {brand.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
