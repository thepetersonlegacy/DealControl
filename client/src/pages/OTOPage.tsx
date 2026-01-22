import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, ArrowRight, Crown, Clock, AlertTriangle,
  ShieldCheck, Star, Zap, Lock, Package, Users, Sparkles,
  BookOpen, ClipboardCheck, MessageSquare, PlayCircle, Award, FileCheck
} from "lucide-react";

// OTO Countdown Timer - 30 minutes
function OTOTimer() {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Check if there's a stored end time
    const stored = sessionStorage.getItem('oto_timer_end');
    if (stored) {
      const remaining = Math.max(0, Math.floor((parseInt(stored) - Date.now()) / 1000));
      return remaining;
    }
    // Set new 30-minute timer
    const endTime = Date.now() + 30 * 60 * 1000;
    sessionStorage.setItem('oto_timer_end', endTime.toString());
    return 30 * 60;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (timeLeft === 0) {
    return (
      <div className="text-2xl font-bold text-destructive">
        OFFER EXPIRED
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="bg-background border-2 border-destructive px-6 py-3 rounded-xl">
        <span className="text-4xl font-bold text-destructive">{String(minutes).padStart(2, '0')}</span>
        <span className="text-sm text-muted-foreground block">MINUTES</span>
      </div>
      <span className="text-4xl font-bold text-destructive">:</span>
      <div className="bg-background border-2 border-destructive px-6 py-3 rounded-xl">
        <span className="text-4xl font-bold text-destructive">{String(seconds).padStart(2, '0')}</span>
        <span className="text-sm text-muted-foreground block">SECONDS</span>
      </div>
    </div>
  );
}

// Value Stack Item Component
function ValueItem({ icon: Icon, title, value, description }: { 
  icon: React.ElementType; 
  title: string; 
  value: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <span className="text-primary font-bold">{value}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function OTOPage() {
  const [, navigate] = useLocation();
  const confettiTriggered = useRef(false);
  const [hasSeenOTO, setHasSeenOTO] = useState(false);

  useEffect(() => {
    // Check if user has already seen OTO
    const seen = sessionStorage.getItem('oto_seen');
    if (seen) {
      setHasSeenOTO(true);
    } else {
      sessionStorage.setItem('oto_seen', 'true');
    }

    // Fire confetti
    if (!confettiTriggered.current) {
      confettiTriggered.current = true;
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
      }, 500);
    }
  }, []);

  const handleAcceptOTO = () => {
    navigate('/checkout?product=ultimate-mastery-system&special=oto');
  };

  const handleDecline = () => {
    sessionStorage.removeItem('oto_timer_end');
    navigate('/library');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Urgency Header */}
      <div className="bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground py-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <span className="text-xl font-bold">⚠️ ONE-TIME OFFER - You Will NEVER See This Again!</span>
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Congratulations Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Wait! Your Order Is <span className="text-primary">Almost Complete</span>...
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Before you go, we have an <strong>exclusive one-time offer</strong> that will 
            <span className="text-foreground font-semibold"> 10X your results</span>.
          </p>
        </motion.div>

        {/* Timer Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg text-muted-foreground mb-4">This offer expires in:</p>
          <OTOTimer />
          <p className="text-sm text-destructive mt-3 font-medium">
            When this timer hits zero, this page will redirect and you'll lose this offer forever.
          </p>
        </motion.div>

        {/* The Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">ULTIMATE UPGRADE</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                DealControl Ultimate Mastery System
              </h2>
              <p className="text-xl text-muted-foreground">
                Get <strong>EVERYTHING</strong> we've ever created — every SOP, checklist, script,
                playbook, and bundle in our entire library, <strong>PLUS exclusive bonuses</strong>.
              </p>
            </div>

            {/* Value Stack */}
            <div className="bg-card rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Here's Everything You Get:
              </h3>

              <ValueItem
                icon={BookOpen}
                title="Complete Transaction Risk Control System"
                value="$1,499"
                description="All 37 SOPs covering every aspect of Texas real estate transactions"
              />
              <ValueItem
                icon={ClipboardCheck}
                title="Full Checklist Library"
                value="$897"
                description="Every risk prevention and compliance checklist we've created"
              />
              <ValueItem
                icon={MessageSquare}
                title="Master Negotiation Scripts"
                value="$645"
                description="Word-for-word scripts for every deal scenario"
              />
              <ValueItem
                icon={FileCheck}
                title="Complete Playbook Collection"
                value="$1,997"
                description="Our strategic playbooks for scaling and team building"
              />
              <ValueItem
                icon={Users}
                title="Office License (Unlimited Users)"
                value="$2,999"
                description="License for your entire brokerage or team"
              />
              <ValueItem
                icon={PlayCircle}
                title="Video Training Academy"
                value="$497"
                description="Step-by-step implementation training for every tool"
              />
              <ValueItem
                icon={Award}
                title="BONUS: Priority Support (1 Year)"
                value="$297"
                description="Direct email access for implementation questions"
              />
              <ValueItem
                icon={Sparkles}
                title="BONUS: Lifetime Updates"
                value="$997"
                description="Every future update and new release, forever"
              />

              {/* Total Value */}
              <div className="mt-6 pt-6 border-t-2 border-primary/20">
                <div className="flex items-center justify-between text-xl">
                  <span className="font-bold">Total Value:</span>
                  <span className="text-muted-foreground line-through">$9,828</span>
                </div>
              </div>
            </div>

            {/* Special Price */}
            <div className="text-center mb-8">
              <p className="text-lg text-muted-foreground mb-2">Your Special One-Time Price:</p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-4xl text-muted-foreground line-through">$9,828</span>
                <span className="text-6xl font-bold text-primary">$1,997</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">You Save $7,831 (80% OFF)</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button
                onClick={handleAcceptOTO}
                size="lg"
                className="text-2xl px-12 py-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl group animate-pulse"
              >
                <Crown className="w-7 h-7 mr-3" />
                YES! Give Me The Ultimate System for $1,997
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Why This Offer */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Why Are We Offering This?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We know that agents who go "all in" see the best results. By getting the complete system now,
            you'll implement faster, protect more transactions, and build a truly systemized business.
            <strong className="text-foreground"> This is the only time you'll ever see this price.</strong>
          </p>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-muted/30">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
            </div>
            <p className="text-center text-foreground italic mb-4">
              "Getting the Ultimate System was the best business decision I made all year.
              I've already recovered the cost 10X over from deals that would have fallen apart without these tools."
            </p>
            <p className="text-center text-sm text-muted-foreground">
              — David Chen, Broker/Owner, Chen Real Estate Group
            </p>
          </Card>
        </motion.div>

        {/* Decline Option */}
        <div className="text-center mt-12">
          <button
            onClick={handleDecline}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            No thanks, I don't want to save $7,831 on the complete system
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DealControl. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

