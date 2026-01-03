import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import heroBackground from "@assets/generated_images/Hero_background_digital_products_60fdc964.png";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6" data-testid="text-hero-title">
          Professional checklists, scripts, and SOPs for when real estate mistakes are expensive.
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
          DealControl provides transaction-ready assets used to reduce risk, prevent disputes, and keep deals from drifting off course.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button asChild size="lg" className="text-lg px-8 py-6" data-testid="button-hero-cta">
            <Link href="/library">
              <a>Browse Asset Library</a>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 backdrop-blur-md bg-background/50" data-testid="button-hero-secondary">
            <Link href="/library?filter=bundles">
              <a>View Bundles</a>
            </Link>
          </Button>
        </div>

        <p className="text-foreground/80 text-lg max-w-2xl mx-auto" data-testid="text-hero-tagline">
          Built for professionals who protect transactions, not chase them.
        </p>
      </div>
    </section>
  );
}
