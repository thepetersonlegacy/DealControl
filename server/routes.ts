import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupLocalAuth, isAuthenticated, isAdmin as localIsAdmin } from "./localAuth";
import Stripe from "stripe";
import { insertProductSchema, insertFunnelSchema, insertFunnelStepSchema, insertOrderBumpSchema, insertSubscriberSchema, insertEmailLogSchema, insertDownloadEventSchema } from "@shared/schema";
import { z } from "zod";

const downloadLogSchema = z.object({
  token: z.string().min(1, "Token is required"),
  fileKey: z.string().min(1, "FileKey is required"),
  eventType: z.string().optional(),
});

const downloadPortalQuerySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const downloadFileQuerySchema = z.object({
  token: z.string().min(1, "Token is required"),
  fileKey: z.string().min(1, "FileKey is required"),
});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (local auth with username/password)
  await setupLocalAuth(app);

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

  // Admin: Create product
  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid product data", details: parsed.error.format() });
      }
      const product = await storage.createProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Admin: Bulk create products
  app.post("/api/products/bulk", isAuthenticated, async (req: any, res) => {
    try {
      const { products: productsArray } = req.body;
      if (!Array.isArray(productsArray)) {
        return res.status(400).json({ error: "Expected products array" });
      }
      const created = [];
      for (const productData of productsArray) {
        const parsed = insertProductSchema.safeParse(productData);
        if (parsed.success) {
          const product = await storage.createProduct(parsed.data);
          created.push(product);
        }
      }
      res.status(201).json({ created: created.length, products: created });
    } catch (error) {
      console.error("Error bulk creating products:", error);
      res.status(500).json({ error: "Failed to bulk create products" });
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
      const { productId, tier, priceOverride } = req.body;
      
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const amount = priceOverride && typeof priceOverride === 'number' ? priceOverride : product.price;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          productId: product.id,
          userId: req.user.claims.sub,
          tier: tier || 'solo',
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        product,
        totalAmount: amount,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent: " + error.message });
    }
  });

  app.post("/api/confirm-purchase", isAuthenticated, async (req: any, res) => {
    try {
      const { productId, paymentIntentId, includeOrderBump, orderBumpId } = req.body;
      
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
      
      // Check if purchase already exists (idempotency)
      const existingPurchases = await storage.getUserPurchases(userId);
      const existingPurchase = existingPurchases.find(p => p.stripePaymentId === paymentIntentId && !p.parentPurchaseId);
      
      if (existingPurchase) {
        const existingProduct = await storage.getProduct(existingPurchase.productId);
        const purchaseWithChildren = await storage.getPurchaseWithChildren(existingPurchase.id);
        let orderBumpPurchase = null;
        let orderBumpProduct = null;
        if (purchaseWithChildren && purchaseWithChildren.children.length > 0) {
          orderBumpPurchase = purchaseWithChildren.children[0];
          orderBumpProduct = await storage.getProduct(orderBumpPurchase.productId);
        }
        return res.json({
          purchase: existingPurchase,
          product: existingProduct,
          orderBumpPurchase,
          orderBumpProduct,
        });
      }
      
      // Create main product purchase
      const purchase = await storage.createPurchase({
        userId,
        productId,
        amount: product.price,
        stripePaymentId: paymentIntentId,
      });
      
      // Create order bump purchase as child if included
      let orderBumpPurchase = null;
      let orderBumpProduct = null;
      if (includeOrderBump && orderBumpId) {
        const orderBump = await storage.getOrderBump(orderBumpId);
        if (orderBump && orderBump.isActive === 1) {
          orderBumpPurchase = await storage.createPurchase({
            userId,
            productId: orderBump.bumpProductId,
            amount: orderBump.bumpPrice,
            stripePaymentId: paymentIntentId,
            parentPurchaseId: purchase.id,
          });
          orderBumpProduct = await storage.getProduct(orderBump.bumpProductId);
        }
      }
      
      res.json({
        purchase,
        product,
        orderBumpPurchase,
        orderBumpProduct,
      });
    } catch (error: any) {
      console.error("Error confirming purchase:", error);
      res.status(500).json({ error: "Failed to confirm purchase: " + error.message });
    }
  });

  app.get("/api/purchases/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const purchaseWithChildren = await storage.getPurchaseWithChildren(id);
      
      if (!purchaseWithChildren) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      
      const { purchase, children } = purchaseWithChildren;
      
      if (purchase.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const product = await storage.getProduct(purchase.productId);
      
      let orderBumpPurchase = null;
      let orderBumpProduct = null;
      if (children.length > 0) {
        orderBumpPurchase = children[0];
        orderBumpProduct = await storage.getProduct(orderBumpPurchase.productId);
      }
      
      res.json({
        purchase,
        product,
        orderBumpPurchase,
        orderBumpProduct,
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

  // ========== USER DASHBOARD ENDPOINTS ==========

  app.get("/api/user/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      
      const purchasesWithProducts = await Promise.all(
        purchases.map(async (purchase) => {
          const product = await storage.getProduct(purchase.productId);
          return { purchase, product };
        })
      );
      
      res.json(purchasesWithProducts);
    } catch (error: any) {
      console.error("Error fetching user purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases: " + error.message });
    }
  });

  app.get("/api/user/purchases/:purchaseId/download", isAuthenticated, async (req: any, res) => {
    try {
      const { purchaseId } = req.params;
      const userId = req.user.claims.sub;
      
      const purchase = await storage.getPurchase(purchaseId);
      
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      
      if (purchase.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const product = await storage.getProduct(purchase.productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const recentDownload = await storage.getRecentDownloadForPurchase(purchaseId, 10);
      const download = recentDownload || await storage.createDownload({ purchaseId });
      
      res.json({
        download,
        product,
        downloadUrl: `/api/downloads/${product.id}`,
      });
    } catch (error: any) {
      console.error("Error creating download:", error);
      res.status(500).json({ error: "Failed to create download: " + error.message });
    }
  });

  app.get("/api/user/downloads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const downloads = await storage.getUserDownloads(userId);
      res.json(downloads);
    } catch (error: any) {
      console.error("Error fetching user downloads:", error);
      res.status(500).json({ error: "Failed to fetch downloads: " + error.message });
    }
  });

  // ========== DOWNLOAD ENDPOINT ==========

  app.get("/api/downloads/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.claims.sub;
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const purchases = await storage.getUserPurchases(userId);
      const hasPurchased = purchases.some(p => p.productId === productId);
      
      if (!hasPurchased) {
        return res.status(403).json({ error: "You have not purchased this product" });
      }
      
      if (product.imageUrl) {
        return res.redirect(product.imageUrl);
      }
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${product.title.replace(/\s+/g, '-').toLowerCase()}.txt"`);
      res.send(`Thank you for purchasing "${product.title}"!\n\nThis is a demo download file.\n\nIn a real application, this would be the actual product content.\n\nProduct Details:\n- Title: ${product.title}\n- Description: ${product.description}\n- Format: ${product.format}\n- Category: ${product.category}`);
    } catch (error: any) {
      console.error("Error downloading product:", error);
      res.status(500).json({ error: "Failed to download product: " + error.message });
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
        if (orderBump) {
          if (orderBump.productId !== productId) {
            return res.status(400).json({ error: "Order bump does not belong to this product" });
          }
          if (orderBump.isActive === 1) {
            bumpProduct = await storage.getProduct(orderBump.bumpProductId);
            totalAmount += orderBump.bumpPrice;
          }
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
        
        // Handle zero-price offers (free bonuses)
        if (price <= 0) {
          // Create purchase without payment
          await storage.createPurchase({
            userId,
            productId: product.id,
            amount: 0,
            stripePaymentId: null,
            parentPurchaseId: session.entryPurchaseId || undefined,
          });
          
          // Move to next step
          const acceptedSteps = [...(session.acceptedSteps || []), stepId];
          const newStepIndex = session.currentStepIndex + 1;
          const newTotalRevenue = session.totalRevenue + price;
          
          await storage.updateFunnelSession(sessionId, {
            acceptedSteps,
            currentStepIndex: newStepIndex,
            totalRevenue: newTotalRevenue,
          });
          
          if (newStepIndex >= activeSteps.length) {
            await storage.updateFunnelSession(sessionId, { status: "completed", completedAt: new Date() });
            return res.json({ completed: true });
          }
          
          const nextStep = activeSteps[newStepIndex];
          const nextProduct = await storage.getProduct(nextStep.offerProductId);
          const isLastStep = newStepIndex >= activeSteps.length - 1;
          
          return res.json({ nextStep: { ...nextStep, product: nextProduct }, isLastStep, completed: false });
        }
        
        // Paid offers require payment
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
        const isLastStep = newStepIndex >= activeSteps.length - 1;
        
        res.json({ nextStep: { ...nextStep, product: nextProduct }, isLastStep, completed: false });
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

  // ========== FUNNEL MANAGEMENT ENDPOINTS ==========

  app.get("/api/funnels", isAuthenticated, async (req: any, res) => {
    try {
      const funnels = await storage.getAllFunnels();
      res.json(funnels);
    } catch (error: any) {
      console.error("Error fetching funnels:", error);
      res.status(500).json({ error: "Failed to fetch funnels: " + error.message });
    }
  });

  app.post("/api/funnels", isAuthenticated, async (req: any, res) => {
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

  app.put("/api/funnels/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const parsed = insertFunnelSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid funnel data", details: parsed.error.errors });
      }
      
      const funnel = await storage.updateFunnel(id, parsed.data);
      
      if (!funnel) {
        return res.status(404).json({ error: "Funnel not found" });
      }
      
      res.json(funnel);
    } catch (error: any) {
      console.error("Error updating funnel:", error);
      res.status(500).json({ error: "Failed to update funnel: " + error.message });
    }
  });

  app.delete("/api/funnels/:id", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/funnels/:funnelId/steps", isAuthenticated, async (req: any, res) => {
    try {
      const { funnelId } = req.params;
      const stepData = { ...req.body, funnelId };
      
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

  app.delete("/api/funnels/:funnelId/steps/:stepId", isAuthenticated, async (req: any, res) => {
    try {
      const { stepId } = req.params;
      const deleted = await storage.deleteFunnelStep(stepId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Step not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting step:", error);
      res.status(500).json({ error: "Failed to delete step: " + error.message });
    }
  });

  // Get all order bumps (public for admin dashboard)
  app.get("/api/order-bumps", isAuthenticated, async (req: any, res) => {
    try {
      const orderBumps = await storage.getAllOrderBumps();
      res.json(orderBumps);
    } catch (error: any) {
      console.error("Error fetching order bumps:", error);
      res.status(500).json({ error: "Failed to fetch order bumps: " + error.message });
    }
  });

  app.post("/api/order-bumps", isAuthenticated, async (req: any, res) => {
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

  app.delete("/api/order-bumps/:id", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/admin/order-bumps", isAuthenticated, localIsAdmin, async (req: any, res) => {
    try {
      const orderBumps = await storage.getAllOrderBumps();
      
      const enrichedOrderBumps = await Promise.all(orderBumps.map(async (orderBump) => {
        const mainProduct = await storage.getProduct(orderBump.productId);
        const bumpProduct = await storage.getProduct(orderBump.bumpProductId);
        return {
          ...orderBump,
          mainProduct,
          bumpProduct,
        };
      }));
      
      // Filter out order bumps where mainProduct or bumpProduct is null/undefined
      const completeOrderBumps = enrichedOrderBumps.filter(
        (ob) => ob.mainProduct != null && ob.bumpProduct != null
      );
      
      res.json(completeOrderBumps);
    } catch (error: any) {
      console.error("Error fetching order bumps:", error);
      res.status(500).json({ error: "Failed to fetch order bumps: " + error.message });
    }
  });

  app.get("/api/admin/sessions", isAuthenticated, localIsAdmin, async (req: any, res) => {
    try {
      const sessions = await storage.getAllFunnelSessions();
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions: " + error.message });
    }
  });

  app.get("/api/admin/analytics/funnels", isAuthenticated, localIsAdmin, async (req: any, res) => {
    try {
      const funnels = await storage.getAllFunnels();
      const sessions = await storage.getAllFunnelSessions();
      const allPurchases = await storage.getAllPurchases();

      const analytics = await Promise.all(funnels.map(async (funnel) => {
        const funnelSessions = sessions.filter(s => s.funnelId === funnel.id);
        const completedSessions = funnelSessions.filter(s => s.status === "completed");
        const totalSessions = funnelSessions.length;
        const completionRate = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;
        
        // Compute revenue: use session.totalRevenue when available, otherwise sum purchases linked to session
        let totalRevenue = 0;
        let sessionsWithRevenueCount = 0;
        
        for (const session of funnelSessions) {
          let sessionRevenue = session.totalRevenue || 0;
          
          // If session has no totalRevenue, sum purchases linked to this session
          if (sessionRevenue === 0) {
            const sessionPurchases = allPurchases.filter(p => p.funnelSessionId === session.id);
            sessionRevenue = sessionPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
          }
          
          if (sessionRevenue > 0) {
            sessionsWithRevenueCount++;
          }
          totalRevenue += sessionRevenue;
        }
        
        const avgOrderValue = sessionsWithRevenueCount > 0 ? totalRevenue / sessionsWithRevenueCount : 0;

        const steps = await storage.getFunnelSteps(funnel.id);
        const entryProduct = funnel.entryProductId ? await storage.getProduct(funnel.entryProductId) : null;

        return {
          funnel,
          entryProduct,
          steps,
          totalSessions,
          completedSessions: completedSessions.length,
          completionRate,
          totalRevenue,
          avgOrderValue,
        };
      }));

      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching funnel analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics: " + error.message });
    }
  });

  app.get("/api/admin/analytics/funnels/:id", isAuthenticated, localIsAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const funnel = await storage.getFunnel(id);
      
      if (!funnel) {
        return res.status(404).json({ error: "Funnel not found" });
      }

      const allSessions = await storage.getAllFunnelSessions();
      const allPurchases = await storage.getAllPurchases();
      const funnelSessions = allSessions.filter(s => s.funnelId === id);
      const completedSessions = funnelSessions.filter(s => s.status === "completed");
      const abandonedSessions = funnelSessions.filter(s => s.status === "abandoned");
      const activeSessions = funnelSessions.filter(s => s.status === "active");
      
      // Compute revenue: use session.totalRevenue when available, otherwise sum purchases linked to session
      let totalRevenue = 0;
      let sessionsWithRevenueCount = 0;
      
      for (const session of funnelSessions) {
        let sessionRevenue = session.totalRevenue || 0;
        
        // If session has no totalRevenue, sum purchases linked to this session
        if (sessionRevenue === 0) {
          const sessionPurchases = allPurchases.filter(p => p.funnelSessionId === session.id);
          sessionRevenue = sessionPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
        }
        
        if (sessionRevenue > 0) {
          sessionsWithRevenueCount++;
        }
        totalRevenue += sessionRevenue;
      }
      
      const avgOrderValue = sessionsWithRevenueCount > 0 ? totalRevenue / sessionsWithRevenueCount : 0;

      const steps = await storage.getFunnelSteps(id);
      const stepAnalytics = steps.map(step => {
        const acceptedCount = funnelSessions.filter(s => s.acceptedSteps?.includes(step.id)).length;
        const declinedCount = funnelSessions.filter(s => s.declinedSteps?.includes(step.id)).length;
        const totalInteractions = acceptedCount + declinedCount;
        const acceptanceRate = totalInteractions > 0 ? (acceptedCount / totalInteractions) * 100 : 0;
        
        return {
          step,
          acceptedCount,
          declinedCount,
          acceptanceRate,
        };
      });

      const entryProduct = funnel.entryProductId ? await storage.getProduct(funnel.entryProductId) : null;

      res.json({
        funnel,
        entryProduct,
        totalSessions: funnelSessions.length,
        completedSessions: completedSessions.length,
        abandonedSessions: abandonedSessions.length,
        activeSessions: activeSessions.length,
        completionRate: funnelSessions.length > 0 ? (completedSessions.length / funnelSessions.length) * 100 : 0,
        totalRevenue,
        avgOrderValue,
        stepAnalytics,
      });
    } catch (error: any) {
      console.error("Error fetching funnel analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics: " + error.message });
    }
  });

  // ========== EMAIL MARKETING ENDPOINTS ==========

  app.post("/api/subscribe", async (req, res) => {
    try {
      const parsed = insertSubscriberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
      }

      const { email, firstName, source } = parsed.data;

      const existingSubscriber = await storage.getSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.status(409).json({ error: "Email already subscribed" });
      }

      const subscriber = await storage.createSubscriber({
        email,
        firstName: firstName || null,
        source: source || "homepage",
        isActive: 1,
      });

      res.status(201).json({ message: "Successfully subscribed", subscriber });
    } catch (error: any) {
      console.error("Error creating subscriber:", error);
      res.status(500).json({ error: "Failed to subscribe: " + error.message });
    }
  });

  app.get("/api/admin/subscribers", isAuthenticated, localIsAdmin, async (req: any, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error: any) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ error: "Failed to fetch subscribers: " + error.message });
    }
  });

  app.post("/api/email/log", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertEmailLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
      }

      const emailLog = await storage.createEmailLog(parsed.data);
      res.status(201).json(emailLog);
    } catch (error: any) {
      console.error("Error creating email log:", error);
      res.status(500).json({ error: "Failed to log email: " + error.message });
    }
  });

  // ========== DOWNLOAD PORTAL ENDPOINTS (Elite Tier) ==========

  app.get("/api/downloads/portal", async (req, res) => {
    try {
      const parsed = downloadPortalQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Access token required", details: parsed.error.errors });
      }

      const { token } = parsed.data;
      const accessToken = await storage.getAccessTokenByToken(token);
      
      if (!accessToken) {
        return res.status(404).json({ error: "Invalid access token", valid: false });
      }

      if (accessToken.revokedAt) {
        return res.status(403).json({ error: "Access token has been revoked", valid: false });
      }

      if (accessToken.expiresAt && new Date(accessToken.expiresAt) < new Date()) {
        return res.status(403).json({ error: "Access token has expired", valid: false });
      }

      const purchase = await storage.getPurchase(accessToken.purchaseId);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found", valid: false });
      }

      const product = await storage.getProduct(purchase.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found", valid: false });
      }

      // Log first access if not already logged
      let accessLogged = false;
      if (!accessToken.firstAccessAt) {
        await storage.updateAccessTokenFirstAccess(accessToken.id);
        await storage.createDownloadEvent({
          purchaseId: purchase.id,
          tokenId: accessToken.id,
          eventType: 'ACCESS',
          ip: req.ip || null,
          userAgent: req.headers['user-agent'] || null,
        });
        accessLogged = true;
      }

      // Generate file list (placeholder files for now)
      const files = [
        { key: 'main-document', name: product.title, format: 'PDF', size: '2.4 MB' },
        { key: 'quick-reference', name: `${product.title} - Quick Reference`, format: 'PDF', size: '450 KB' },
        { key: 'checklist', name: `${product.title} - Checklist`, format: 'PDF', size: '320 KB' },
      ];

      res.json({
        valid: true,
        licenseType: accessToken.licenseType,
        productTitle: product.title,
        purchaseDate: new Date(purchase.purchasedAt * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        files,
        accessLogged,
      });
    } catch (error: any) {
      console.error("Error fetching download portal:", error);
      res.status(500).json({ error: "Failed to load download portal: " + error.message });
    }
  });

  app.post("/api/downloads/log", async (req, res) => {
    try {
      const parsed = downloadLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error.errors });
      }

      const { token, fileKey, eventType } = parsed.data;

      const accessToken = await storage.getAccessTokenByToken(token);
      if (!accessToken || accessToken.revokedAt) {
        return res.status(403).json({ error: "Invalid or revoked token" });
      }

      await storage.createDownloadEvent({
        purchaseId: accessToken.purchaseId,
        tokenId: accessToken.id,
        eventType: eventType || 'DOWNLOAD',
        fileKey,
        ip: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error logging download:", error);
      res.status(500).json({ error: "Failed to log download: " + error.message });
    }
  });

  app.get("/api/downloads/file", async (req, res) => {
    try {
      const parsed = downloadFileQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: "Token and fileKey required", details: parsed.error.errors });
      }

      const { token, fileKey } = parsed.data;
      const accessToken = await storage.getAccessTokenByToken(token);
      if (!accessToken || accessToken.revokedAt) {
        return res.status(403).json({ error: "Invalid or revoked token" });
      }

      // For now, return a placeholder response
      // In production, this would serve actual files from storage
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileKey}.pdf"`);
      res.send('Placeholder PDF content - replace with actual file in production');
    } catch (error: any) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
