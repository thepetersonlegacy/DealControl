import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Download, ArrowRight, Gift, Clock, 
  ShieldCheck, Star, Zap, Lock, AlertTriangle, BookOpen
} from "lucide-react";

// Countdown Timer for Tripwire Offer
function TripwireTimer() {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center justify-center gap-2 text-2xl font-mono">
      <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg">
        <span className="font-bold">{String(minutes).padStart(2, '0')}</span>
      </div>
      <span className="text-destructive font-bold">:</span>
      <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg">
        <span className="font-bold">{String(seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

export default function MIFGEThankYou() {
  const [, navigate] = useLocation();
  const [leadInfo, setLeadInfo] = useState<{ name: string; email: string } | null>(null);
  const confettiTriggered = useRef(false);

  useEffect(() => {
    // Get lead info from session storage
    const stored = sessionStorage.getItem('mifge_lead');
    if (stored) {
      setLeadInfo(JSON.parse(stored));
    }

    // Fire confetti
    if (!confettiTriggered.current) {
      confettiTriggered.current = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, []);

  const handleDownload = () => {
    // In production, this would trigger actual download
    window.open('/downloads/dealcontrol-starter-system.zip', '_blank');
  };

  const handleTripwireOffer = () => {
    // Navigate to checkout with special tripwire offer
    navigate('/checkout?product=transaction-risk-kit-pro&special=tripwire');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-green-500 text-white py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="w-6 h-6" />
          <span className="text-xl font-bold">Success! Your Free System Is Ready</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Thank You Message */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <Gift className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Welcome{leadInfo?.name ? `, ${leadInfo.name}` : ''}! 🎉
          </h1>
          <p className="text-xl text-muted-foreground">
            Your DealControl Starter System is ready for download.
          </p>
        </motion.div>

        {/* Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 mb-12 border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Step 1: Download Your Free System
              </h2>
              <p className="text-muted-foreground mb-6">
                Click below to download all 12 SOPs, 8 checklists, 5 scripts, and bonus materials.
              </p>
              <Button
                onClick={handleDownload}
                size="lg"
                className="text-lg px-8 py-6 bg-green-500 hover:bg-green-600"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Your Free System Now
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                📧 We've also sent a copy to {leadInfo?.email || 'your email'}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Tripwire Offer - One Time Special */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 border-2 border-destructive/30 bg-destructive/5">
            {/* Urgency Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full mb-4">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-bold">ONE-TIME OFFER - This Page Only</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Wait! Don't Miss This Special Upgrade
              </h2>
              <p className="text-muted-foreground">
                This offer expires when you leave this page
              </p>
              <div className="mt-4">
                <TripwireTimer />
              </div>
            </div>

            {/* Offer Details */}
            <div className="bg-card rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Transaction Risk Control Kit - PRO
                  </h3>
                  <p className="text-sm text-muted-foreground">Team License (Up to 10 Users)</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                You just got our Starter System for FREE. Now upgrade to the PRO version and get:
              </p>

              <div className="grid md:grid-cols-2 gap-3 mb-6">
                {[
                  "Everything in the Starter System",
                  "Advanced negotiation playbooks",
                  "Team implementation guides",
                  "License for up to 10 users",
                  "Priority email support",
                  "Quarterly update releases",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="text-center py-4 border-t border-b border-border">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-2xl text-muted-foreground line-through">$899</span>
                  <span className="text-4xl font-bold text-primary">$197</span>
                  <span className="bg-destructive text-destructive-foreground text-sm px-3 py-1 rounded-full">
                    78% OFF
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  One-time payment • Instant access • 30-day guarantee
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button
                onClick={handleTripwireOffer}
                size="lg"
                className="text-xl px-10 py-7 bg-primary hover:bg-primary/90 shadow-xl group"
              >
                <Zap className="w-6 h-6 mr-2" />
                YES! Upgrade Me to PRO for $197
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>30-Day Guarantee</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/library')}
                className="mt-6 text-sm text-muted-foreground hover:text-foreground underline"
              >
                No thanks, I'll stick with the free version
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
          </div>
          <p className="text-muted-foreground">
            "Upgrading to PRO was a no-brainer. The team training guides alone saved us 20+ hours."
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            — Michael Torres, Team Lead, San Antonio
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 DealControl a <a href="https://petersonproservices.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">Peterson Pro Services, LLC</a> Product. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

