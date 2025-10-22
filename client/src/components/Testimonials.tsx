import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Digital Entrepreneur",
    content: "These products have transformed my business. I can now offer value to my audience without spending months creating content from scratch.",
    rating: 5,
    initials: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Online Coach",
    content: "The quality is outstanding. I use these as bonuses for my coaching programs and my clients absolutely love them.",
    rating: 5,
    initials: "MC",
  },
  {
    name: "Emma Williams",
    role: "Content Creator",
    content: "Best investment I've made for my business. The variety of formats and topics is incredible. Highly recommended!",
    rating: 5,
    initials: "EW",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4" data-testid="text-testimonials-title">
            Rated 4.7/5 overall by our users
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-testimonials-subtitle">
            "Must have content"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover-elevate active-elevate-2 transition-all" data-testid={`card-testimonial-${index}`}>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground" data-testid={`text-testimonial-name-${index}`}>
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid={`text-testimonial-role-${index}`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <div className="flex mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground" data-testid={`text-testimonial-content-${index}`}>
                "{testimonial.content}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
