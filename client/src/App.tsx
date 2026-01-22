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
import Start from "@/pages/Start";
import KitTransactionRisk from "@/pages/KitTransactionRisk";
import Office from "@/pages/Office";
import LegalRefunds from "@/pages/LegalRefunds";
import Downloads from "@/pages/Downloads";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import LandingPage from "@/pages/LandingPage";
import OfferPage from "@/pages/OfferPage";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/offer/:offerId" component={OfferPage} />
      <Route path="/library" component={Library} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/purchase-success" component={PurchaseSuccess} />
      <Route path="/funnel/:sessionId" component={FunnelOffer} />
      <Route path="/admin" component={Admin} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/terms" component={Terms} />
      <Route path="/start" component={Start} />
      <Route path="/kit/transaction-risk" component={KitTransactionRisk} />
      <Route path="/office" component={Office} />
      <Route path="/legal/refunds" component={LegalRefunds} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
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
        <ExitIntentPopup />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
