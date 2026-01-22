import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, ArrowRight, 
  Zap, Star, Users, FileCheck, Gift
} from "lucide-react";
import heroBackground from "@assets/generated_images/Hero_background_digital_products_60fdc964.png";

// Countdown Timer Component
function CountdownTimer({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      
      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center justify-center gap-2 text-lg font-mono">
      <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg">
        <span className="font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-sm">h</span>
      </div>
      <span className="text-destructive">:</span>
      <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg">
        <span className="font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-sm">m</span>
      </div>
      <span className="text-destructive">:</span>
      <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg">
        <span className="font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-sm">s</span>
      </div>
    </div>
  );
}

// Benefit checkmark item
function BenefitItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div 
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
      <span className="text-foreground">{children}</span>
    </motion.div>
  );
}

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [offerEndTime] = useState(() => {
    const end = new Date();
    end.setHours(end.getHours() + 2);
    return end;
  });

  const handleGetOffer = () => {
    // Navigate to the offer page with the tripwire product
    navigate('/offer/transaction-risk-kit');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Urgency Bar */}
      <div className="bg-destructive text-destructive-foreground py-2 px-4 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">LIMITED TIME:</span>
          <span>90% OFF ends in</span>
          <CountdownTimer endTime={offerEndTime} />
        </div>
      </div>

      {/* Hero Section - Direct to Offer */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
          {/* Social Proof Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Trusted by 2,847+ Texas Real Estate Professionals</span>
          </motion.div>

          {/* Main Headline - M.I.F.G.E. "Make It" - Establish the problem */}
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Stop Losing Deals to
            <span className="text-destructive"> Preventable Mistakes</span>
          </motion.h1>

          {/* Subheadline - Agitate the problem */}
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            One missed deadline. One overlooked disclosure. One vague contract clause.
            <span className="text-foreground font-semibold"> That's all it takes to destroy a $15,000 commission.</span>
          </motion.p>

          {/* Value Stack Preview */}
          <motion.div
            className="bg-card border rounded-xl p-6 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-primary" />
              <span className="font-semibold text-lg">Today Only: Get The Complete Transaction Risk Kit</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-left mb-4">
              <BenefitItem>12 Transaction SOPs ($1,548 value)</BenefitItem>
              <BenefitItem>8 Risk Checklists ($1,032 value)</BenefitItem>
              <BenefitItem>5 Negotiation Scripts ($645 value)</BenefitItem>
              <BenefitItem>Instant Digital Download</BenefitItem>
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-2xl text-muted-foreground line-through">$499</span>
              <span className="text-4xl font-bold text-primary">$49</span>
              <span className="bg-destructive text-destructive-foreground text-sm px-2 py-1 rounded">90% OFF</span>
            </div>
          </motion.div>

          {/* Primary CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleGetOffer}
              size="lg"
              className="text-xl px-12 py-8 bg-primary hover:bg-primary/90 shadow-2xl group"
            >
              <Zap className="w-6 h-6 mr-2" />
              YES! Give Me Instant Access For $49
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              30-Day Money Back Guarantee • Instant Download • Secure Checkout
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem Agitation Section - M.I.F.G.E. "Fill It" */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Hidden Cost of "Winging It" in Real Estate
            </h2>
            <p className="text-xl text-muted-foreground">
              Every year, agents lose <span className="text-destructive font-semibold">$2.3 billion</span> in commissions to deals that fall apart from preventable errors.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: AlertTriangle, title: "Missed Deadlines", stat: "23%", desc: "of deals fail due to missed option or financing deadlines" },
              { icon: FileCheck, title: "Disclosure Gaps", stat: "31%", desc: "of lawsuits stem from incomplete or missing disclosures" },
              { icon: Clock, title: "Communication Delays", stat: "18%", desc: "of buyers walk away due to poor follow-up timing" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 text-center h-full">
                  <item.icon className="w-10 h-10 text-destructive mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">{item.stat}</div>
                  <div className="font-semibold text-foreground mb-2">{item.title}</div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="bg-card border-2 border-primary/20 rounded-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">
              What if you had a system that <span className="text-primary">eliminated these risks</span>?
            </h3>
            <p className="text-muted-foreground mb-6">
              A complete library of battle-tested SOPs, checklists, and scripts specifically designed for Texas real estate transactions.
            </p>
            <Button onClick={handleGetOffer} size="lg" className="group">
              Get Protected Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Social Proof */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-primary text-primary" />)}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Trusted by Top-Producing Texas Agents
            </h2>
            <p className="text-muted-foreground">Real results from real professionals</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Maria Rodriguez", role: "Broker, Houston", quote: "These SOPs saved my team from a $40K lawsuit. Worth every penny times a hundred." },
              { name: "James Chen", role: "Top Producer, Austin", quote: "I closed 12 more deals this year just by having proper follow-up scripts in place." },
              { name: "Sarah Mitchell", role: "Team Lead, Dallas", quote: "Finally, I can onboard new agents without worrying they'll miss critical steps." },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(j => <Star key={j} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                  <p className="text-foreground mb-4 italic">"{t.quote}"</p>
                  <div>
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Risk Reversal */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              100% Risk-Free Guarantee
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Try the Transaction Risk Control Kit for 30 days. If it doesn't save you time, stress, and potential lawsuits,
              email us for a <span className="text-foreground font-semibold">full refund</span>. No questions asked.
            </p>
            <Button onClick={handleGetOffer} size="lg" className="text-xl px-12 py-8 group">
              <Zap className="w-6 h-6 mr-2" />
              Get Instant Access - Only $49
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-6">
              Join 2,847+ Texas agents who trust DealControl to protect their transactions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DealControl. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <a href="/legal/refunds" className="hover:text-foreground">Refund Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

