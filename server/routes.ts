import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";
import { insertFunnelSchema, insertFunnelStepSchema, insertOrderBumpSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function isAdmin(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.isAdmin !== 1) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Failed to verify admin status" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: product.price,
        currency: "usd",
        metadata: {
          productId: product.id,
          userId: req.user.claims.sub,
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        product 
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent: " + error.message });
    }
  });

  app.post("/api/confirm-purchase", isAuthenticated, async (req: any, res) => {
    try {
      const { productId, paymentIntentId } = req.body;
      
      if (!productId || !paymentIntentId) {
        return res.status(400).json({ error: "Product ID and Payment Intent ID are required" });
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ error: "Payment not successful" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const userId = req.user.claims.sub;
      
      const purchase = await storage.createPurchase({
        userId,
        productId,
        amount: product.price,
        stripePaymentId: paymentIntentId,
      });
      
      res.json(purchase);
    } catch (error: any) {
      console.error("Error confirming purchase:", error);
      res.status(500).json({ error: "Failed to confirm purchase: " + error.message });
    }
  });

  app.get("/api/purchases/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const purchases = await storage.getUserPurchases(userId);
      const purchase = purchases.find(p => p.id === id);
      
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      
      const product = await storage.getProduct(purchase.productId);
      
      res.json({
        ...purchase,
        product,
      });
    } catch (error: any) {
      console.error("Error fetching purchase:", error);
      res.status(500).json({ error: "Failed to fetch purchase: " + error.message });
    }
  });

  app.get("/api/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error: any) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases: " + error.message });
    }
  });

  // ========== ORDER BUMP ENDPOINTS ==========

  app.get("/api/order-bump/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const { productId } = req.params;
      const orderBump = await storage.getOrderBumpByProduct(productId);
      
      if (!orderBump || orderBump.isActive !== 1) {
        return res.json(null);
      }
      
      const bumpProduct = await storage.getProduct(orderBump.bumpProductId);
      res.json({ ...orderBump, bumpProduct });
    } catch (error: any) {
      console.error("Error fetching order bump:", error);
      res.status(500).json({ error: "Failed to fetch order bump: " + error.message });
    }
  });

  app.post("/api/checkout/with-bump", isAuthenticated, async (req: any, res) => {
    try {
      const { productId, includeOrderBump } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      let totalAmount = product.price;
      let orderBump = null;
      let bumpProduct = null;
      
      if (includeOrderBump) {
        orderBump = await storage.getOrderBumpByProduct(productId);
        if (orderBump && orderBump.isActive === 1) {
          bumpProduct = await storage.getProduct(orderBump.bumpProductId);
          totalAmount += orderBump.bumpPrice;
        }
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "usd",
        metadata: {
          productId: product.id,
          userId: req.user.claims.sub,
          includeOrderBump: includeOrderBump ? "true" : "false",
          orderBumpId: orderBump?.id || "",
        },
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        product,
        orderBump: orderBump ? { ...orderBump, bumpProduct } : null,
        totalAmount,
      });
    } catch (error: any) {
      console.error("Error creating payment intent with bump:", error);
      res.status(500).json({ error: "Failed to create payment intent: " + error.message });
    }
  });

  // ========== FUNNEL SESSION ENDPOINTS ==========

  app.post("/api/funnel/start", isAuthenticated, async (req: any, res) => {
    try {
      const { purchaseId, productId } = req.body;
      const userId = req.user.claims.sub;
      
      if (!purchaseId || !productId) {
        return res.status(400).json({ error: "purchaseId and productId are required" });
      }
      
      // Security: Validate that the purchase exists, belongs to the user, and matches the product
      const purchase = await storage.getPurchase(purchaseId);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      if (purchase.userId !== userId) {
        return res.status(403).json({ error: "Access denied - purchase does not belong to you" });
      }
      if (purchase.productId !== productId) {
        return res.status(400).json({ error: "Product ID does not match purchase" });
      }
      
      const funnel = await storage.getFunnelByEntryProduct(productId);
      
      if (!funnel || funnel.isActive !== 1) {
        return res.json({ funnelSession: null, hasNextStep: false });
      }
      
      const steps = await storage.getFunnelSteps(funnel.id);
      const activeSteps = steps.filter(s => s.isActive === 1).sort((a, b) => a.priority - b.priority);
      
      if (activeSteps.length === 0) {
        return res.json({ funnelSession: null, hasNextStep: false });
      }
      
      const funnelSession = await storage.createFunnelSession({
        userId,
        funnelId: funnel.id,
        entryPurchaseId: purchaseId,
        currentStepIndex: 0,
        status: "active",
        acceptedSteps: [],
        declinedSteps: [],
        totalRevenue: 0,
      });
      
      res.json({ funnelSession, hasNextStep: activeSteps.length > 0 });
    } catch (error: any) {
      console.error("Error starting funnel:", error);
      res.status(500).json({ error: "Failed to start funnel: " + error.message });
    }
  });

  app.get("/api/funnel/session/:sessionId/next", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.claims.sub;
      
      const session = await storage.getFunnelSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Funnel session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      if (session.status !== "active") {
        return res.json({ step: null, product: null, isLastStep: true });
      }
      
      const steps = await storage.getFunnelSteps(session.funnelId);
      const activeSteps = steps.filter(s => s.isActive === 1).sort((a, b) => a.priority - b.priority);
      
      if (session.currentStepIndex >= activeSteps.length) {
        await storage.updateFunnelSession(sessionId, { status: "completed", completedAt: new Date() });
        return res.json({ step: null, product: null, isLastStep: true });
      }
      
      const currentStep = activeSteps[session.currentStepIndex];
      const product = await storage.getProduct(currentStep.offerProductId);
      const isLastStep = session.currentStepIndex >= activeSteps.length - 1;
      
      res.json({ step: currentStep, product, isLastStep });
    } catch (error: any) {
      console.error("Error getting next funnel step:", error);
      res.status(500).json({ error: "Failed to get next step: " + error.message });
    }
  });

  app.post("/api/funnel/session/:sessionId/respond", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { stepId, accepted } = req.body;
      const userId = req.user.claims.sub;
      
      if (stepId === undefined || accepted === undefined) {
        return res.status(400).json({ error: "stepId and accepted are required" });
      }
      
      const session = await storage.getFunnelSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Funnel session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const steps = await storage.getFunnelSteps(session.funnelId);
      const activeSteps = steps.filter(s => s.isActive === 1).sort((a, b) => a.priority - b.priority);
      const currentStep = activeSteps.find(s => s.id === stepId);
      
      if (!currentStep) {
        return res.status(404).json({ error: "Step not found" });
      }
      
      if (accepted) {
        const product = await storage.getProduct(currentStep.offerProductId);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        
        const price = currentStep.priceOverride ?? product.price;
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: price,
          currency: "usd",
          metadata: {
            productId: product.id,
            userId,
            funnelSessionId: sessionId,
            funnelStepId: stepId,
          },
        });
        
        res.json({ clientSecret: paymentIntent.client_secret, product, price });
      } else {
        const declinedSteps = [...(session.declinedSteps || []), stepId];
        const newStepIndex = session.currentStepIndex + 1;
        
        await storage.updateFunnelSession(sessionId, {
          declinedSteps,
          currentStepIndex: newStepIndex,
        });
        
        if (newStepIndex >= activeSteps.length) {
          await storage.updateFunnelSession(sessionId, { status: "completed", completedAt: new Date() });
          return res.json({ completed: true });
        }
        
        const nextStep = activeSteps[newStepIndex];
        const nextProduct = await storage.getProduct(nextStep.offerProductId);
        
        res.json({ nextStep: { ...nextStep, product: nextProduct }, completed: false });
      }
    } catch (error: any) {
      console.error("Error responding to funnel step:", error);
      res.status(500).json({ error: "Failed to respond to step: " + error.message });
    }
  });

  app.post("/api/funnel/session/:sessionId/complete-step", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { stepId, paymentIntentId } = req.body;
      const userId = req.user.claims.sub;
      
      if (!stepId || !paymentIntentId) {
        return res.status(400).json({ error: "stepId and paymentIntentId are required" });
      }
      
      const session = await storage.getFunnelSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Funnel session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ error: "Payment not successful" });
      }
      
      const steps = await storage.getFunnelSteps(session.funnelId);
      const activeSteps = steps.filter(s => s.isActive === 1).sort((a, b) => a.priority - b.priority);
      const currentStep = activeSteps.find(s => s.id === stepId);
      
      if (!currentStep) {
        return res.status(404).json({ error: "Step not found" });
      }
      
      const product = await storage.getProduct(currentStep.offerProductId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const price = currentStep.priceOverride ?? product.price;
      
      const purchase = await storage.createPurchase({
        userId,
        productId: product.id,
        amount: price,
        stripePaymentId: paymentIntentId,
        funnelSessionId: sessionId,
        funnelStepId: stepId,
      });
      
      const acceptedSteps = [...(session.acceptedSteps || []), stepId];
      const newTotalRevenue = (session.totalRevenue || 0) + price;
      const newStepIndex = session.currentStepIndex + 1;
      
      await storage.updateFunnelSession(sessionId, {
        acceptedSteps,
        totalRevenue: newTotalRevenue,
        currentStepIndex: newStepIndex,
      });
      
      if (newStepIndex >= activeSteps.length) {
        await storage.updateFunnelSession(sessionId, { status: "completed", completedAt: new Date() });
        return res.json({ purchase, completed: true });
      }
      
      const nextStep = activeSteps[newStepIndex];
      const nextProduct = await storage.getProduct(nextStep.offerProductId);
      
      res.json({ purchase, nextStep: { ...nextStep, product: nextProduct }, completed: false });
    } catch (error: any) {
      console.error("Error completing funnel step:", error);
      res.status(500).json({ error: "Failed to complete step: " + error.message });
    }
  });

  // ========== ADMIN FUNNEL MANAGEMENT ENDPOINTS ==========

  app.get("/api/admin/funnels", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const funnels = await storage.getAllFunnels();
      res.json(funnels);
    } catch (error: any) {
      console.error("Error fetching funnels:", error);
      res.status(500).json({ error: "Failed to fetch funnels: " + error.message });
    }
  });

  app.post("/api/admin/funnels", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = insertFunnelSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid funnel data", details: parsed.error.errors });
      }
      
      const funnel = await storage.createFunnel(parsed.data);
      res.json(funnel);
    } catch (error: any) {
      console.error("Error creating funnel:", error);
      res.status(500).json({ error: "Failed to create funnel: " + error.message });
    }
  });

  app.put("/api/admin/funnels/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const funnel = await storage.updateFunnel(id, req.body);
      
      if (!funnel) {
        return res.status(404).json({ error: "Funnel not found" });
      }
      
      res.json(funnel);
    } catch (error: any) {
      console.error("Error updating funnel:", error);
      res.status(500).json({ error: "Failed to update funnel: " + error.message });
    }
  });

  app.delete("/api/admin/funnels/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFunnel(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Funnel not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting funnel:", error);
      res.status(500).json({ error: "Failed to delete funnel: " + error.message });
    }
  });

  app.post("/api/admin/funnels/:id/steps", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const stepData = { ...req.body, funnelId: id };
      
      const parsed = insertFunnelStepSchema.safeParse(stepData);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid step data", details: parsed.error.errors });
      }
      
      const step = await storage.createFunnelStep(parsed.data);
      res.json(step);
    } catch (error: any) {
      console.error("Error creating funnel step:", error);
      res.status(500).json({ error: "Failed to create step: " + error.message });
    }
  });

  app.put("/api/admin/funnel-steps/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const step = await storage.updateFunnelStep(id, req.body);
      
      if (!step) {
        return res.status(404).json({ error: "Step not found" });
      }
      
      res.json(step);
    } catch (error: any) {
      console.error("Error updating step:", error);
      res.status(500).json({ error: "Failed to update step: " + error.message });
    }
  });

  app.delete("/api/admin/funnel-steps/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFunnelStep(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Step not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting step:", error);
      res.status(500).json({ error: "Failed to delete step: " + error.message });
    }
  });

  app.post("/api/admin/order-bumps", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = insertOrderBumpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid order bump data", details: parsed.error.errors });
      }
      
      const orderBump = await storage.createOrderBump(parsed.data);
      res.json(orderBump);
    } catch (error: any) {
      console.error("Error creating order bump:", error);
      res.status(500).json({ error: "Failed to create order bump: " + error.message });
    }
  });

  app.put("/api/admin/order-bumps/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const orderBump = await storage.updateOrderBump(id, req.body);
      
      if (!orderBump) {
        return res.status(404).json({ error: "Order bump not found" });
      }
      
      res.json(orderBump);
    } catch (error: any) {
      console.error("Error updating order bump:", error);
      res.status(500).json({ error: "Failed to update order bump: " + error.message });
    }
  });

  app.delete("/api/admin/order-bumps/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteOrderBump(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Order bump not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting order bump:", error);
      res.status(500).json({ error: "Failed to delete order bump: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
