import { X } from "lucide-react";

const notItems = [
  "Not a course",
  "Not coaching",
  "Not motivational",
  "Not trendy",
  "Not theory",
];

export function WhatThisIsNot() {
  return (
    <section className="py-24 bg-accent/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8" data-testid="text-whatitisnot-title">
          What This Is Not
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {notItems.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full"
              data-testid={`item-not-${index}`}
            >
              <X className="w-4 h-4 text-destructive" />
              <span className="text-foreground font-medium">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-xl text-muted-foreground" data-testid="text-whatitisnot-summary">
          These are <span className="text-foreground font-semibold">operational assets</span>, not content.
        </p>
      </div>
    </section>
  );
}
