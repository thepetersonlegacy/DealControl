import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import type { Product } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Loader2,
  ArrowLeft,
  Download,
  CheckCircle,
  Shield,
  FileText,
  Clock,
  MapPin,
  AlertTriangle,
  Target,
  ClipboardList,
  Scale,
  Users,
  Building2,
  User,
} from "lucide-react";

type LicenseTier = "solo" | "pro" | "office";

interface TierInfo {
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  icon: typeof User;
  features: string[];
}

const tierDetails: Record<LicenseTier, TierInfo> = {
  solo: {
    name: "Solo",
    price: 12900,
    priceLabel: "$129",
    description: "For one individual professional",
    icon: User,
    features: [
      "One-time purchase",
      "Per-version, perpetual access",
      "Use internally within license scope",
      "No subscription required",
    ],
  },
  pro: {
    name: "Pro",
    price: 21900,
    priceLabel: "$219",
    description: "For one business and its immediate internal team",
    icon: Users,
    features: [
      "One-time purchase",
      "Per-version, perpetual access",
      "Team-wide internal use",
      "No subscription required",
    ],
  },
  office: {
    name: "Office",
    price: 69900,
    priceLabel: "$699/year",
    description: "For one organization or brokerage",
    icon: Building2,
    features: [
      "Annual internal-use license",
      "Organization-wide access",
      "Includes updates during license term",
      "Internal version control support",
    ],
  },
};

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<LicenseTier>("solo");

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      return response.json();
    },
  });

  const handlePurchase = () => {
    const tierPrice = tierDetails[selectedTier].price;
    setLocation(`/checkout?productId=${product?.id}&tier=${selectedTier}&price=${tierPrice}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" data-testid="loader-product-detail" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-product-not-found">
              Product Not Found
            </h2>
            <Button asChild data-testid="button-back-to-library">
              <Link href="/library">Back to Library</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const contentSections = [
    {
      id: "purpose-scope",
      title: "Purpose & Scope",
      icon: Target,
      content: product.purposeScope || "Professional documentation designed to support clearer processes, better documentation, and earlier risk identification. These materials are used before problems escalate, not after.",
    },
    {
      id: "use-conditions",
      title: "Use Conditions",
      icon: FileText,
      content: product.useConditions || "For internal use by real estate agents, brokers, investors, and transaction coordinators. If your work involves deadlines, third parties, or written records, this material is relevant.",
    },
    {
      id: "risks-addressed",
      title: "Risks Addressed",
      icon: AlertTriangle,
      content: product.risksAddressed || "Transaction errors, documentation gaps, earnest money disputes, financing fallout, inspection objection handling, appraisal gaps, and timeline communication breakdowns.",
    },
    {
      id: "core-content",
      title: "Core Content",
      icon: ClipboardList,
      content: product.coreContent || "Includes SOPs, playbooks, scripts, checklists, and templates. Each asset is plain-language, professionally structured, immediately usable, and delivered as downloadable files.",
    },
    {
      id: "failure-points",
      title: "Failure Points This Prevents",
      icon: Shield,
      content: product.failurePoints || "Prevents unclear communication with clients, missed deadlines, undocumented decisions, disorganized file management, and reactive problem-solving when proactive control was possible.",
    },
    {
      id: "recordkeeping",
      title: "Recordkeeping Guidance",
      icon: FileText,
      content: product.recordkeepingGuidance || "Built-in documentation protocols ensure every critical step is recorded. Supports audit trails, compliance requirements, and professional liability protection.",
    },
    {
      id: "judgment-boundary",
      title: "Judgment Boundary",
      icon: Scale,
      content: product.judgmentBoundary || "This material provides operational support only. It is not legal, financial, or tax advice. Users are responsible for compliance with all applicable laws and for consulting appropriate licensed professionals when necessary.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="outline" className="mb-8" data-testid="button-back">
            <Link href="/library">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <Card className="overflow-hidden sticky top-28">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full aspect-[3/4] object-cover"
                  data-testid="img-product-detail"
                />
              </Card>
            </div>

            <div className="space-y-8">
              <div>
                <Badge variant="secondary" className="mb-4" data-testid="badge-product-category">
                  {product.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="text-product-detail-title">
                  {product.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6" data-testid="text-product-detail-description">
                  {product.description}
                </p>

                <div className="flex items-center gap-2 flex-wrap mb-6">
                  <Badge variant="outline" data-testid="badge-one-time">
                    <Clock className="w-3 h-3 mr-1" />
                    One-Time Purchase
                  </Badge>
                  <Badge variant="outline" data-testid="badge-no-subscription">
                    No Subscription
                  </Badge>
                </div>
              </div>

              <Card className="p-6" data-testid="card-checkout">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="text-checkout-headline">
                  Don't Risk Another Deal — Lock It Down Now
                </h2>
                <p className="text-muted-foreground mb-6" data-testid="text-checkout-pre-cta">
                  Designed for Texas real estate professionals who don't have time to reinvent the wheel.
                </p>

                <div className="space-y-3 mb-6">
                  {(Object.entries(tierDetails) as [LicenseTier, TierInfo][]).map(([tier, info]) => {
                    const IconComponent = info.icon;
                    const isSelected = selectedTier === tier;
                    return (
                      <button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover-elevate"
                        }`}
                        data-testid={`button-tier-${tier}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-md ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{info.name}</span>
                                {tier === "pro" && (
                                  <Badge variant="default" className="text-xs">Popular</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{info.description}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xl font-bold text-foreground">{info.priceLabel}</span>
                            {tier !== "office" && (
                              <p className="text-xs text-muted-foreground">one-time</p>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <ul className="mt-3 pl-11 space-y-1">
                            {info.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                      </button>
                    );
                  })}
                </div>

                <Button
                  size="lg"
                  className="w-full text-lg py-6 mb-4"
                  onClick={handlePurchase}
                  data-testid="button-purchase"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Select License & Download
                </Button>

                <div className="flex items-center justify-center gap-4 flex-wrap text-sm text-muted-foreground mb-4" data-testid="trust-badges">
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Instant PDF Download
                  </span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Lifetime Access
                  </span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Texas-Specific
                  </span>
                </div>

                <p className="text-xs text-muted-foreground text-center" data-testid="text-disclaimer">
                  This is a procedural asset, not legal advice. Consult appropriate professionals for specific situations.
                </p>
              </Card>

              <Card data-testid="card-content-sections">
                <CardHeader>
                  <CardTitle className="text-xl" data-testid="text-whats-included">
                    What's Inside This Kit
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Accordion type="single" collapsible className="w-full" data-testid="accordion-content">
                    {contentSections.map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <AccordionItem key={section.id} value={section.id} data-testid={`accordion-item-${section.id}`}>
                          <AccordionTrigger className="text-left" data-testid={`accordion-trigger-${section.id}`}>
                            <span className="flex items-center gap-3">
                              <IconComponent className="w-4 h-4 text-primary flex-shrink-0" />
                              {section.title}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent data-testid={`accordion-content-${section.id}`}>
                            <p className="text-muted-foreground pl-7">{section.content}</p>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>

              <Card className="p-6" data-testid="card-who-for">
                <h3 className="text-lg font-semibold text-foreground mb-4">Who This Is For</h3>
                <ul className="space-y-2 mb-6">
                  {[
                    "Real estate agents and brokers",
                    "Investors and transaction coordinators",
                    "Professionals managing active files",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3" data-testid={`list-item-who-for-${index}`}>
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold text-foreground mb-4">Who This Is Not For</h3>
                <ul className="space-y-2">
                  {[
                    "Those seeking legal, financial, or tax advice",
                    "Those looking for a course or coaching",
                    "Those needing a substitute for licensed professionals",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground" data-testid={`list-item-who-not-${index}`}>
                      <span className="text-muted-foreground">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 bg-muted/50" data-testid="card-delivery">
                <h3 className="text-lg font-semibold text-foreground mb-4">Delivery & Access</h3>
                <ul className="space-y-2">
                  {[
                    "Instant digital download",
                    "Files delivered immediately after purchase",
                    "You keep access to the version you buy",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3" data-testid={`list-item-delivery-${index}`}>
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
