import { Card } from "@/components/ui/card";
import { BookOpen, RefreshCw, Award, Package } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Private Label Rights",
    description: "Sell, rebrand, edit, and use as you want, without any restrictions.",
  },
  {
    icon: Package,
    title: "1000+ Digital Products",
    description: "Almost unlimited selection in one of the biggest libraries. Endless options to use.",
  },
  {
    icon: BookOpen,
    title: "15 Media Formats",
    description: "Ebooks, Videos, Audios, Templates, Prompts, Notion Systems, and more.",
  },
  {
    icon: RefreshCw,
    title: "Constantly Updated",
    description: "The latest up to date trends, ensuring reliability and accuracy.",
  },
];

export function FeatureHighlights() {
  return (
    <section className="py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4" data-testid="text-features-title">
            Sell digital products that are ready to market
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-features-subtitle">
            Imagine you have over 1000 done-for-you digital products. Including video courses, ebooks, templates, and more. 
            Sell them as your own products or use the content anywhere. <strong>You set the limits</strong>.
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
      </div>
    </section>
  );
}
