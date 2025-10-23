import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

  const httpServer = createServer(app);

  return httpServer;
}
