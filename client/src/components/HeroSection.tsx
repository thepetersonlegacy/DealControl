import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Star } from "lucide-react";
import heroBackground from "@assets/generated_images/Hero_background_digital_products_60fdc964.png";

const customerAvatars = [
  { initials: "AV", name: "Alvin" },
  { initials: "SM", name: "Saleem" },
  { initials: "LY", name: "Lily" },
  { initials: "DN", name: "Danu" },
  { initials: "RD", name: "Rudy" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6" data-testid="text-hero-title">
          Tools for When <br className="hidden sm:block" />
          Deals Matter
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
          Professional SOPs, checklists, and playbooks for Texas real estate agents. 
          Prevent costly mistakes and close deals with confidence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button asChild size="lg" className="text-lg px-8 py-6" data-testid="button-hero-cta">
            <Link href="/library">
              <a>Explore Master Library</a>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 backdrop-blur-md bg-background/50" data-testid="button-hero-secondary">
            <Link href="/library">
              <a>Learn More</a>
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex -space-x-3">
            {customerAvatars.map((customer, index) => (
              <Avatar key={index} className="border-2 border-background w-12 h-12" data-testid={`avatar-customer-${index}`}>
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {customer.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <p className="text-foreground font-semibold text-lg" data-testid="text-social-proof">
            Trusted by Texas real estate professionals
          </p>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-muted-foreground font-medium" data-testid="text-rating">
              4.7/5 overall rating
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
