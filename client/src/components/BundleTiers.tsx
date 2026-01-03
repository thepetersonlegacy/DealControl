import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, User, Users, Building } from "lucide-react";

const bundles = [
  {
    name: "Solo",
    icon: User,
    description: "For individual professionals who want fewer problems and cleaner files.",
    features: [
      "Core SOPs and checklists",
      "Editable PDFs",
      "Personal use license",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    icon: Users,
    description: "For high-volume agents, investors, and team leads.",
    features: [
      "Expanded asset sets",
      "Client-facing scripts",
      "Internal workflows",
      "Editable formats",
    ],
    highlight: true,
  },
  {
    name: "Office License",
    icon: Building,
    description: "For brokerages, firms, and organizations.",
    features: [
      "Office-wide internal use rights",
      "White-label internal documents",
      "Compliance disclaimers",
      "SOP adoption guidance",
    ],
    note: "Designed for internal use only. Not for resale.",
    highlight: false,
  },
];

export function BundleTiers() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4" data-testid="text-bundles-title">
            Bundles
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-bundles-subtitle">
            Risk-Based, Not Hype-Based
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bundles.map((bundle, index) => {
            const Icon = bundle.icon;
            return (
              <Card 
                key={index} 
                className={`p-8 flex flex-col hover-elevate transition-all ${bundle.highlight ? 'ring-2 ring-primary' : ''}`}
                data-testid={`card-bundle-${index}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bundle.highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/10'}`}>
                    <Icon className={`w-6 h-6 ${bundle.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground" data-testid={`text-bundle-name-${index}`}>
                    {bundle.name}
                  </h3>
                </div>
                
                <p className="text-muted-foreground mb-6" data-testid={`text-bundle-description-${index}`}>
                  {bundle.description}
                </p>

                <ul className="space-y-3 mb-6 flex-grow">
                  {bundle.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2" data-testid={`item-bundle-feature-${index}-${featureIndex}`}>
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {bundle.note && (
                  <p className="text-sm text-muted-foreground italic mb-4" data-testid={`text-bundle-note-${index}`}>
                    {bundle.note}
                  </p>
                )}

                <Button 
                  asChild 
                  variant={bundle.highlight ? "default" : "outline"}
                  className="w-full"
                  data-testid={`button-bundle-${index}`}
                >
                  <Link href="/library?filter=bundles">
                    <a>View {bundle.name} Bundle</a>
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-2" data-testid="text-pricing-info">
            Most individual assets are priced $29–$199, depending on scope.
          </p>
          <p className="text-muted-foreground" data-testid="text-no-subscription">
            No subscriptions required.
          </p>
        </div>
      </div>
    </section>
  );
}
