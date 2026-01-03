import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Gift } from "lucide-react";
import type { OrderBump as OrderBumpType, Product } from "@shared/schema";

interface OrderBumpWithProduct extends OrderBumpType {
  bumpProduct: Product;
}

interface OrderBumpProps {
  orderBump: OrderBumpWithProduct;
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
  isLoading?: boolean;
}

export function OrderBump({ orderBump, isSelected, onToggle, isLoading }: OrderBumpProps) {
  const { bumpProduct, headline, description, bumpPrice } = orderBump;
  
  const originalPrice = bumpProduct.price;
  const savings = originalPrice - bumpPrice;
  const savingsPercent = Math.round((savings / originalPrice) * 100);
  const hasSavings = savings > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative overflow-visible border-2 transition-all duration-300 ${
          isSelected
            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20"
            : "border-purple-300 dark:border-purple-700 hover-elevate"
        }`}
        data-testid="card-order-bump"
      >
        <div className="absolute -top-3 left-4">
          <Badge 
            className="bg-purple-500 text-white border-0"
            data-testid="badge-special-offer"
          >
            <Gift className="w-3 h-3 mr-1" />
            Special Offer
          </Badge>
        </div>

        <div className="p-6 pt-8">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ scale: isSelected ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <img
                src={bumpProduct.imageUrl}
                alt={bumpProduct.title}
                className="w-20 h-20 object-cover rounded-md"
                data-testid="img-bump-product"
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h4 
                  className="font-semibold text-foreground truncate"
                  data-testid="text-bump-title"
                >
                  {headline || bumpProduct.title}
                </h4>
                <div className="flex items-center gap-3 shrink-0">
                  <Label 
                    htmlFor="order-bump-switch" 
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {isSelected ? "Added" : "Add this"}
                  </Label>
                  <Switch
                    id="order-bump-switch"
                    checked={isSelected}
                    onCheckedChange={onToggle}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-purple-500"
                    data-testid="switch-order-bump"
                  />
                </div>
              </div>

              <p 
                className="text-sm text-muted-foreground mb-3 line-clamp-2"
                data-testid="text-bump-description"
              >
                {description || bumpProduct.description}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <span 
                  className="text-lg font-bold text-purple-600 dark:text-purple-400"
                  data-testid="text-bump-price"
                >
                  ${(bumpPrice / 100).toFixed(2)}
                </span>
                
                {hasSavings && (
                  <>
                    <span 
                      className="text-sm text-muted-foreground line-through"
                      data-testid="text-original-price"
                    >
                      ${(originalPrice / 100).toFixed(2)}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      data-testid="badge-savings"
                    >
                      Save {savingsPercent}%
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4" />
                  <span data-testid="text-bump-added">Added to your order</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

export function OrderBumpSkeleton() {
  return (
    <Card className="border-2 border-purple-300 dark:border-purple-700">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-muted animate-pulse rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </div>
      </div>
    </Card>
  );
}
