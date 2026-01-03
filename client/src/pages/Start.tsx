import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, FileText, CheckCircle } from "lucide-react";

export default function Start() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-start-title">
              Transaction Risk Control Kit
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8" data-testid="text-start-subtitle">
              Professional SOPs, checklists, and scripts designed to prevent costly Texas real estate transaction mistakes.
            </p>
            <Button asChild size="lg" data-testid="button-view-kit">
              <Link href="/kit/transaction-risk">
                <a className="flex items-center gap-2">
                  View Kit Details
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Risk Prevention</h3>
              <p className="text-sm text-muted-foreground">
                Systematic procedures to catch issues before they become problems.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <FileText className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Texas-Specific</h3>
              <p className="text-sm text-muted-foreground">
                Built for Texas real estate laws, regulations, and practices.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <CheckCircle className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Ready to Use</h3>
              <p className="text-sm text-muted-foreground">
                Download and implement immediately in your practice.
              </p>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <p className="text-xs text-muted-foreground" data-testid="text-start-disclaimer">
              This material is provided for educational and operational support purposes only and does not constitute legal, financial, or tax advice. Users are responsible for compliance with all applicable local, state, and federal laws and for consulting appropriate licensed professionals when necessary.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
