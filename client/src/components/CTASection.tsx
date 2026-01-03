import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6" data-testid="text-cta-title">
          Why DealControl Exists
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed" data-testid="text-cta-subtitle">
          Most deal problems don't come from bad intent. They come from unclear process. DealControl exists to make sure expectations are aligned early, risk is identified before it compounds, and professionals stay in control of the file. Quietly. Reliably. Repeatedly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="text-lg px-8 py-6 group" data-testid="button-cta-explore">
            <Link href="/library">
              <a className="flex items-center gap-2">
                Browse the Asset Library
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6" data-testid="button-cta-bundles">
            <Link href="/library?filter=bundles">
              <a>View Risk Control Bundles</a>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
