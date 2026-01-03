import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Library from "@/pages/Library";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import PurchaseSuccess from "@/pages/PurchaseSuccess";
import FunnelOffer from "@/pages/FunnelOffer";
import Admin from "@/pages/Admin";
import Dashboard from "@/pages/Dashboard";
import Terms from "@/pages/Terms";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/library" component={Library} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/purchase-success" component={PurchaseSuccess} />
      <Route path="/funnel/:sessionId" component={FunnelOffer} />
      <Route path="/admin" component={Admin} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
