import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, RefreshCw, Shield, CheckCircle, ArrowRight } from "lucide-react";

export default function Office() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Brokerage License</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-office-title">
              Office License
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-office-subtitle">
              Organization-wide access to the complete DealControl asset library for your entire brokerage or team.
            </p>
          </div>

          <Card className="p-8 mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">$699<span className="text-lg font-normal text-muted-foreground">/year</span></h2>
                <p className="text-muted-foreground">Annual license with updates included</p>
              </div>
              <Button asChild size="lg" data-testid="button-get-office">
                <Link href="/library?filter=bundles">
                  <a className="flex items-center gap-2">
                    Get Office License
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  What's Included
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Complete access to all 39 DealControl assets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">All SOPs, checklists, scripts, and playbooks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Updates released during your license term</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">VERITAS-1 Λ Elite Tier content standards</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  License Scope
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">All employees and agents in your organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Internal use within your brokerage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Customize and adapt for internal procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Print copies for team training and reference</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <RefreshCw className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Annual Updates</h3>
              <p className="text-sm text-muted-foreground">
                Receive all new assets and updates released during your license term.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Users className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Unlimited Users</h3>
              <p className="text-sm text-muted-foreground">
                Share with your entire organization — no per-seat fees.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Texas-Specific</h3>
              <p className="text-sm text-muted-foreground">
                Built for Texas real estate laws, regulations, and practices.
              </p>
            </Card>
          </div>

          <Card className="p-6 bg-muted/50 mb-8">
            <h3 className="font-semibold text-foreground mb-3">License Restrictions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Materials may not be sublicensed or distributed outside your organization.</li>
              <li>May not be resold, redistributed, or used for external training.</li>
              <li>License covers internal use only — not for client distribution.</li>
            </ul>
          </Card>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground" data-testid="text-office-disclaimer">
              This material is provided for educational and operational support purposes only and does not constitute legal, financial, or tax advice. Users are responsible for compliance with all applicable local, state, and federal laws and for consulting appropriate licensed professionals when necessary.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
