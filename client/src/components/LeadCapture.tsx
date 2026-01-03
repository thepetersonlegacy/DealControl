import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Mail } from "lucide-react";

interface LeadCaptureProps {
  source?: string;
  className?: string;
}

export function LeadCapture({ source = "homepage", className = "" }: LeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; firstName?: string; source: string }) => {
      const response = await apiRequest("POST", "/api/subscribe", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive exclusive deals and updates.",
      });
      setEmail("");
      setFirstName("");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to subscribe. Please try again.";
      if (message.includes("already subscribed")) {
        toast({
          title: "Already subscribed",
          description: "This email is already on our list.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription failed",
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({
      email,
      firstName: firstName || undefined,
      source,
    });
  };

  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4" data-testid="text-leadcapture-title">
          Get Exclusive Deals & Updates
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-leadcapture-description">
          Join our newsletter and be the first to know about new products, special offers, and insider tips to grow your business.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <Input
            type="text"
            placeholder="First name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="flex-shrink-0 sm:w-40"
            data-testid="input-firstname"
          />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
            data-testid="input-email"
          />
          <Button
            type="submit"
            disabled={subscribeMutation.isPending || !email}
            className="flex-shrink-0"
            data-testid="button-subscribe"
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4" data-testid="text-privacy-notice">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
