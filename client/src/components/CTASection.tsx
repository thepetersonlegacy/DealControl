import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-cta-title">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta-subtitle">
          Join 20,000+ entrepreneurs who are already using our digital products to grow their businesses.
        </p>
        <Button asChild size="lg" className="text-lg px-8 py-6 group" data-testid="button-cta-explore">
          <Link href="/library">
            <a className="flex items-center gap-2">
              Explore Master Library
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </Link>
        </Button>
      </div>
    </section>
  );
}
