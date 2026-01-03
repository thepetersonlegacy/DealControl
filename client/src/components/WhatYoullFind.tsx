import { Card } from "@/components/ui/card";
import { 
  FileCheck, 
  Home, 
  Building2, 
  Briefcase,
  ShieldAlert,
  Clock,
  DollarSign,
  Scale,
  Users,
  FileWarning,
  ClipboardList,
  UserCheck
} from "lucide-react";

const categories = [
  {
    title: "Transaction Control",
    description: "Assets that prevent:",
    items: [
      { icon: DollarSign, text: "Earnest money disputes" },
      { icon: ShieldAlert, text: "Financing fallouts" },
      { icon: FileCheck, text: "Inspection and appraisal breakdowns" },
      { icon: Clock, text: "Timeline misalignment" },
    ],
  },
  {
    title: "Estate, Probate & Court Sales",
    description: "Clear, structured tools for:",
    items: [
      { icon: Scale, text: "Executor-led property sales" },
      { icon: Users, text: "Heir interference prevention" },
      { icon: Building2, text: "Court-ordered and out-of-state transactions" },
    ],
  },
  {
    title: "Landlord & Rental Risk",
    description: "Operational clarity for:",
    items: [
      { icon: Home, text: "First-time landlords" },
      { icon: UserCheck, text: "Tenant screening and deposits" },
      { icon: FileWarning, text: "Lease violations and documentation" },
    ],
  },
  {
    title: "Agent & Office Operations",
    description: "Internal systems for:",
    items: [
      { icon: ClipboardList, text: "Client intake and expectation alignment" },
      { icon: FileCheck, text: "Compliance-clean files" },
      { icon: Briefcase, text: "Reduced broker intervention" },
    ],
  },
];

export function WhatYoullFind() {
  return (
    <section className="py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4" data-testid="text-whatyoullfind-title">
            What You'll Find Inside
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category, categoryIndex) => (
            <Card 
              key={categoryIndex} 
              className="p-8 hover-elevate transition-all"
              data-testid={`card-category-${categoryIndex}`}
            >
              <h3 className="text-2xl font-semibold text-foreground mb-2" data-testid={`text-category-title-${categoryIndex}`}>
                {category.title}
              </h3>
              <p className="text-muted-foreground mb-6" data-testid={`text-category-description-${categoryIndex}`}>
                {category.description}
              </p>
              <ul className="space-y-4">
                {category.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <li 
                      key={itemIndex} 
                      className="flex items-center gap-3"
                      data-testid={`item-category-${categoryIndex}-${itemIndex}`}
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
