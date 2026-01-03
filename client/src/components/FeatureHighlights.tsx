import { Card } from "@/components/ui/card";
import { ClipboardCheck, FileText, MessageSquare, GitBranch } from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Checklists",
    description: "Step-by-step guides to ensure nothing falls through the cracks during transactions.",
  },
  {
    icon: FileText,
    title: "SOPs",
    description: "Standard operating procedures that create consistency and reduce liability.",
  },
  {
    icon: MessageSquare,
    title: "Scripts",
    description: "Word-for-word language for difficult conversations and negotiations.",
  },
  {
    icon: GitBranch,
    title: "Decision Frameworks",
    description: "Clear decision trees for navigating complex transaction scenarios.",
  },
];

export function FeatureHighlights() {
  return (
    <section className="py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground max-w-4xl mx-auto" data-testid="text-features-title">
            Real estate professionals don't pay for creativity. They pay for clarity, containment, and control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-8 text-center hover-elevate active-elevate-2 transition-all" data-testid={`card-feature-${index}`}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3" data-testid={`text-feature-title-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="text-features-tagline">
            Designed to be used before problems escalate, not after. No theory. No coaching. No opinions.
          </p>
        </div>
      </div>
    </section>
  );
}
