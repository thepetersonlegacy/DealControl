import { Card } from "@/components/ui/card";
import { Home, Building2, Scale, Shield, Briefcase } from "lucide-react";

const audiences = [
  { 
    icon: Home, 
    title: "Real Estate Agents & Brokers",
    description: "Protect your license and your clients with proven transaction processes."
  },
  { 
    icon: Building2, 
    title: "Investors & Landlords",
    description: "Manage properties and tenants with consistent, defensible procedures."
  },
  { 
    icon: Scale, 
    title: "Executors & Estate Representatives",
    description: "Navigate complex estate transactions with clear guidance."
  },
  { 
    icon: Shield, 
    title: "Insurance & Lending Professionals",
    description: "Reduce risk exposure with documented compliance procedures."
  },
  { 
    icon: Briefcase, 
    title: "Small Firms Managing Transaction Risk",
    description: "Enterprise-level process control without enterprise-level overhead."
  },
];

export function UseCases() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4" data-testid="text-usecases-title">
            Who This Is For
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-usecases-subtitle">
            If you handle files, money, deadlines, or legal exposure — this is for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <Card 
                key={index} 
                className="p-6 hover-elevate active-elevate-2 transition-all"
                data-testid={`card-audience-${index}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-audience-title-${index}`}>
                      {audience.title}
                    </h3>
                    <p className="text-muted-foreground text-sm" data-testid={`text-audience-desc-${index}`}>
                      {audience.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
