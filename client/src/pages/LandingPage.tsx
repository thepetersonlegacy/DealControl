import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight,
  Zap, Star, Users, FileCheck, Gift, Lock, Download, Award,
  BookOpen, ClipboardCheck, MessageSquare, PlayCircle
} from "lucide-react";
import heroBackground from "@assets/generated_images/Hero_background_digital_products_60fdc964.png";

// Benefit checkmark item
function BenefitItem({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <motion.div
      className={`flex items-start gap-3 ${highlight ? 'bg-primary/5 p-3 rounded-lg border border-primary/20' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
      <span className="text-foreground">{children}</span>
    </motion.div>
  );
}

// Value Stack Item
function ValueStackItem({ icon: Icon, title, value, description }: {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string
}) {
  return (
    <motion.div
      className="flex items-start gap-4 py-4 border-b border-border last:border-0"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">{title}</span>
          <span className="text-muted-foreground line-through text-sm">{value}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClaimFreeGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast({ title: "Please enter your name and email", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Store lead info and navigate to thank you page
    sessionStorage.setItem('mifge_lead', JSON.stringify({ email, name, claimedAt: new Date().toISOString() }));

    // Simulate brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    navigate('/mifge-thank-you');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Gift className="w-5 h-5" />
          <span className="font-bold">FREE:</span>
          <span>Get The Complete $1,497 DealControl Starter System - No Credit Card Required</span>
        </div>
      </div>

      {/* Hero Section - M.I.F.G.E. Offer */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Copy */}
            <div>
              {/* Social Proof Badge */}
              <motion.div
                className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Join 2,847+ Texas Agents Who Downloaded This</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Get The Complete
                <span className="text-primary"> $1,497 DealControl Starter System</span>
                <span className="block text-3xl md:text-4xl mt-2">Absolutely FREE</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                className="text-xl text-muted-foreground mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                The same proven system top-producing Texas agents use to
                <span className="text-foreground font-semibold"> close more deals, avoid lawsuits, and protect every commission</span> —
                yours today at no cost.
              </motion.p>

              {/* What's Included Preview */}
              <motion.div
                className="space-y-3 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <BenefitItem highlight>
                  <strong>12 Battle-Tested Transaction SOPs</strong> - Never miss a critical step again
                </BenefitItem>
                <BenefitItem>
                  <strong>8 Risk Prevention Checklists</strong> - Catch problems before they kill deals
                </BenefitItem>
                <BenefitItem>
                  <strong>5 Word-for-Word Negotiation Scripts</strong> - Handle any objection with confidence
                </BenefitItem>
                <BenefitItem>
                  <strong>Quick-Start Implementation Guide</strong> - Be up and running in 30 minutes
                </BenefitItem>
                <BenefitItem>
                  <strong>Video Training Overview</strong> - See exactly how to use each tool
                </BenefitItem>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                className="flex items-center gap-6 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-500" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>No Credit Card</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Email Capture Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 border-2 border-primary/20 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Gift className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Claim Your FREE System
                  </h2>
                  <p className="text-muted-foreground">
                    Enter your info below for instant access
                  </p>
                </div>

                {/* Value Reminder */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
                  <span className="text-sm text-muted-foreground">Total Value:</span>
                  <div className="flex items-center justify-center gap-3 mt-1">
                    <span className="text-2xl text-muted-foreground line-through">$1,497</span>
                    <span className="text-3xl font-bold text-green-500">FREE</span>
                  </div>
                </div>

                <form onSubmit={handleClaimFreeGift} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Your First Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Your Best Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Processing..."
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        YES! Send Me The Free System
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  🔒 We respect your privacy. Unsubscribe anytime.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What's Inside Section - Full Value Stack */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Here's Everything You Get <span className="text-primary">FREE</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              A complete done-for-you system worth $1,497
            </p>
          </motion.div>

          <Card className="p-8">
            <ValueStackItem
              icon={BookOpen}
              title="Transaction Risk Control Kit (Solo License)"
              value="$499"
              description="5 core SOPs covering earnest money, financing, inspections, appraisals, and timelines"
            />
            <ValueStackItem
              icon={ClipboardCheck}
              title="8 Risk Prevention Checklists"
              value="$312"
              description="Mortgage fallout, inspection objections, appraisal gaps, and more"
            />
            <ValueStackItem
              icon={MessageSquare}
              title="5 Negotiation Scripts"
              value="$245"
              description="Word-for-word scripts for the most common deal-killing scenarios"
            />
            <ValueStackItem
              icon={FileCheck}
              title="Client Communication Templates"
              value="$147"
              description="Email and text templates for every stage of the transaction"
            />
            <ValueStackItem
              icon={PlayCircle}
              title="Quick-Start Video Training"
              value="$197"
              description="Watch over my shoulder as I show you exactly how to implement each tool"
            />
            <ValueStackItem
              icon={Award}
              title="Implementation Guide"
              value="$97"
              description="Step-by-step guide to be fully operational in under 30 minutes"
            />

            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total Value:</span>
                <span className="text-muted-foreground line-through">$1,497</span>
              </div>
              <div className="flex items-center justify-between text-2xl mt-2">
                <span className="font-bold text-foreground">Today's Price:</span>
                <span className="font-bold text-green-500">FREE</span>
              </div>
            </div>
          </Card>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              size="lg"
              className="text-lg px-8 py-6 group"
            >
              <Gift className="w-5 h-5 mr-2" />
              Claim Your Free System Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              "Why Are You Giving This Away For Free?"
            </h2>
            <div className="text-lg text-muted-foreground space-y-4 text-left">
              <p>
                Great question. Here's the honest answer:
              </p>
              <p>
                <strong className="text-foreground">We believe in leading with value.</strong> When you experience how powerful the DealControl system is,
                you'll understand why thousands of agents trust us to protect their transactions.
              </p>
              <p>
                Some of you will be so impressed that you'll want to see what else we offer — our Pro and Office
                packages with even more advanced tools, team licenses, and priority support.
              </p>
              <p>
                But there's <strong className="text-foreground">no obligation</strong>. If all you ever use is this free system, and it helps you
                close even one more deal or avoid one lawsuit, we've done our job.
              </p>
              <p className="text-foreground font-semibold">
                Fair enough?
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
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
              What Agents Are Saying
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Maria Rodriguez", role: "Broker, Houston", quote: "I downloaded this expecting a basic lead magnet. Instead I got a complete system that saved my team from a $40K lawsuit in the first month." },
              { name: "James Chen", role: "Top Producer, Austin", quote: "I've paid $2,000+ for courses that gave me less than what's in this free system. Absolutely incredible value." },
              { name: "Sarah Mitchell", role: "Team Lead, Dallas", quote: "Finally, I can onboard new agents without worrying they'll miss critical steps. This should be mandatory for every agent." },
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

      {/* Final CTA */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Gift className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Protect Every Transaction?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 2,847+ Texas agents who've already claimed their free DealControl Starter System.
              <span className="block mt-2 text-foreground font-semibold">No credit card. No obligation. Instant access.</span>
            </p>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              size="lg"
              className="text-xl px-12 py-8 group"
            >
              <Zap className="w-6 h-6 mr-2" />
              Get My Free $1,497 System
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 DealControl a <a href="https://petersonproservices.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">Peterson Pro Services, LLC</a> Product. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <a href="/legal/refunds" className="hover:text-foreground">Refund Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

