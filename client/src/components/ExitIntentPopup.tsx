import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ExitIntentPopupProps {
  onClose?: () => void;
  discountCode?: string;
  discountPercent?: number;
  productTitle?: string;
  offerUrl?: string;
}

export function ExitIntentPopup({
  onClose,
  discountCode = 'WAITSTAY25',
  discountPercent = 25,
  productTitle = 'Transaction Risk Control Kit',
  offerUrl = '/offer/transaction-risk-kit?discount=25'
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [hasTriggered, setHasTriggered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Countdown timer
  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [isVisible, timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  // Exit intent detection
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !hasTriggered) {
      const dismissed = sessionStorage.getItem('exitPopupDismissed');
      if (!dismissed) {
        setIsVisible(true);
        setHasTriggered(true);
      }
    }
  }, [hasTriggered]);

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('exitPopupDismissed', 'true');
    onClose?.();
  };

  const handleClaim = () => {
    // Could save email to a list here
    if (email) {
      sessionStorage.setItem('exitPopupEmail', email);
    }
    sessionStorage.setItem('exitPopupDismissed', 'true');
    window.location.href = offerUrl;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="relative max-w-md w-full p-8 bg-gradient-to-br from-background to-muted border-primary/30">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="text-center mb-6">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
                >
                  <Gift className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Wait! Don't Leave Empty-Handed
                </h2>
                <p className="text-muted-foreground">
                  Get <span className="text-primary font-bold">{discountPercent}% OFF</span> the {productTitle}
                </p>
              </div>

              {/* Urgency Timer */}
              <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-destructive/10 rounded-lg">
                <Clock className="w-5 h-5 text-destructive" />
                <span className="text-destructive font-semibold">
                  Offer expires in: {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </span>
              </div>

              {/* Email Input */}
              <div className="space-y-3 mb-6">
                <Input
                  type="email"
                  placeholder="Enter your email for discount"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-center"
                />
                <Button onClick={handleClaim} className="w-full gap-2" size="lg">
                  Claim My {discountPercent}% Discount <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                <span>Use code: <strong className="text-foreground">{discountCode}</strong> at checkout</span>
              </div>

              <button
                onClick={handleClose}
                className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                No thanks, I'll pay full price
              </button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

