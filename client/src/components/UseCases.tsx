import { ShoppingCart, Package, Gift, GraduationCap, Users, BookOpen, Briefcase, TrendingUp, Award } from "lucide-react";

const useCases = [
  { icon: ShoppingCart, label: "Sell as your own product" },
  { icon: Package, label: "Expand product portfolio" },
  { icon: Gift, label: "Offer as free leadmagnet" },
  { icon: GraduationCap, label: "Educate your audience" },
  { icon: Users, label: "Boost your community" },
  { icon: BookOpen, label: "Sell as author on Amazon" },
  { icon: Briefcase, label: "Add to your coaching" },
  { icon: TrendingUp, label: "Build your authority" },
  { icon: Award, label: "Increase trust in your brand" },
];

export function UseCases() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4" data-testid="text-usecases-title">
            Unlimited options to use the products
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-usecases-subtitle">
            You have complete freedom
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center gap-4 p-6 rounded-xl hover-elevate active-elevate-2 transition-all cursor-pointer"
                data-testid={`card-usecase-${index}`}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-foreground font-medium text-center text-sm" data-testid={`text-usecase-${index}`}>
                  {useCase.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
