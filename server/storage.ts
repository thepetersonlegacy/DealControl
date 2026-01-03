import { 
  type User, type UpsertUser, 
  type Product, type InsertProduct, 
  type Purchase, type InsertPurchase, 
  type Download, type InsertDownload,
  type Funnel, type InsertFunnel,
  type FunnelStep, type InsertFunnelStep,
  type OrderBump, type InsertOrderBump,
  type FunnelSession, type InsertFunnelSession,
  products, users, purchases, downloads, funnels, funnelSteps, orderBumps, funnelSessions 
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: string): Promise<Purchase | undefined>;
  getUserPurchases(userId: string): Promise<Purchase[]>;
  
  createDownload(download: InsertDownload): Promise<Download>;
  getPurchaseDownloads(purchaseId: string): Promise<Download[]>;

  createFunnel(funnel: InsertFunnel): Promise<Funnel>;
  getFunnel(id: string): Promise<Funnel | undefined>;
  getFunnelByEntryProduct(productId: string): Promise<Funnel | undefined>;
  updateFunnel(id: string, funnel: Partial<InsertFunnel>): Promise<Funnel | undefined>;
  deleteFunnel(id: string): Promise<boolean>;
  getAllFunnels(): Promise<Funnel[]>;

  createFunnelStep(step: InsertFunnelStep): Promise<FunnelStep>;
  getFunnelSteps(funnelId: string): Promise<FunnelStep[]>;
  updateFunnelStep(id: string, step: Partial<InsertFunnelStep>): Promise<FunnelStep | undefined>;
  deleteFunnelStep(id: string): Promise<boolean>;

  createOrderBump(bump: InsertOrderBump): Promise<OrderBump>;
  getOrderBumpByProduct(productId: string): Promise<OrderBump | undefined>;
  updateOrderBump(id: string, bump: Partial<InsertOrderBump>): Promise<OrderBump | undefined>;
  deleteOrderBump(id: string): Promise<boolean>;

  createFunnelSession(session: InsertFunnelSession): Promise<FunnelSession>;
  getFunnelSession(id: string): Promise<FunnelSession | undefined>;
  updateFunnelSession(id: string, session: Partial<InsertFunnelSession>): Promise<FunnelSession | undefined>;
  getUserFunnelSessions(userId: string): Promise<FunnelSession[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.seedProducts();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const user: User = {
      ...userData,
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isAdmin: userData.isAdmin ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured === 1
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id,
      isFeatured: insertProduct.isFeatured ?? 0 
    };
    this.products.set(id, product);
    return product;
  }

  private seedProducts() {
    const productsData: InsertProduct[] = [
      {
        title: "SEO Mastery Complete Guide",
        description: "Master search engine optimization with this comprehensive guide covering on-page SEO, off-page strategies, technical SEO, and keyword research techniques that drive organic traffic.",
        category: "Marketing",
        format: "Ebook",
        imageUrl: "/attached_assets/generated_images/SEO_ebook_product_cover_c299b5a0.png",
        price: 4900,
        isFeatured: 1,
      },
      {
        title: "Email Marketing Mastery",
        description: "Learn to build high-converting email campaigns, grow your subscriber list, and create automated sequences that generate consistent revenue for your business.",
        category: "Marketing",
        format: "Ebook",
        imageUrl: "/attached_assets/generated_images/Email_marketing_ebook_cover_0ac56840.png",
        price: 3900,
        isFeatured: 1,
      },
      {
        title: "Leadership Communication Skills",
        description: "Develop powerful communication skills that inspire teams, influence stakeholders, and position you as a confident leader in any organization.",
        category: "Leadership",
        format: "Ebook",
        imageUrl: "/attached_assets/generated_images/Leadership_ebook_cover_f73c8e51.png",
        price: 4500,
        isFeatured: 1,
      },
      {
        title: "AI YouTube Growth Strategy",
        description: "Leverage AI tools to create viral YouTube content, optimize your channel, and grow your subscriber base using cutting-edge automation and data-driven strategies.",
        category: "Content Creation",
        format: "Video Course",
        imageUrl: "/attached_assets/generated_images/AI_YouTube_course_cover_a3236f2e.png",
        price: 7900,
        isFeatured: 1,
      },
      {
        title: "Copywriting Mastery Blueprint",
        description: "Write compelling copy that converts browsers into buyers. Master persuasive writing techniques used by top copywriters to create sales pages, ads, and email campaigns.",
        category: "Copywriting",
        format: "Ebook",
        imageUrl: "/attached_assets/generated_images/Copywriting_ebook_cover_2da2baae.png",
        price: 5900,
        isFeatured: 1,
      },
      {
        title: "Social Media Marketing Pro",
        description: "Build a powerful social media presence across all platforms. Learn content strategies, engagement tactics, and paid advertising methods that generate real business results.",
        category: "Marketing",
        format: "Video Course",
        imageUrl: "/attached_assets/generated_images/Social_media_ebook_cover_dd9d3045.png",
        price: 6900,
        isFeatured: 1,
      },
      {
        title: "Content Marketing Strategy",
        description: "Create a content marketing machine that attracts, engages, and converts your ideal customers through blog posts, videos, podcasts, and social media.",
        category: "Marketing",
        format: "Ebook",
        imageUrl: "/attached_assets/generated_images/SEO_ebook_product_cover_c299b5a0.png",
        price: 4200,
        isFeatured: 0,
      },
      {
        title: "Personal Branding Secrets",
        description: "Build a magnetic personal brand that attracts opportunities, clients, and partnerships. Learn positioning, storytelling, and authority-building strategies.",
        category: "Business",
        format: "Ebook",
        imageUrl: "/attached_assets/generated_images/Leadership_ebook_cover_f73c8e51.png",
        price: 3900,
        isFeatured: 0,
      },
      {
        title: "Productivity Mastery System",
        description: "Double your productivity with proven time management systems, focus techniques, and automation strategies used by high-performers worldwide.",
        category: "Productivity",
        format: "Template Pack",
        imageUrl: "/attached_assets/generated_images/Email_marketing_ebook_cover_0ac56840.png",
        price: 2900,
        isFeatured: 0,
      },
      {
        title: "Sales Funnel Blueprint",
        description: "Design high-converting sales funnels that guide prospects from awareness to purchase. Includes templates, scripts, and optimization strategies.",
        category: "Marketing",
        format: "Template Pack",
        imageUrl: "/attached_assets/generated_images/Copywriting_ebook_cover_2da2baae.png",
        price: 5400,
        isFeatured: 0,
      },
      {
        title: "Instagram Growth Accelerator",
        description: "Grow your Instagram following organically with proven content strategies, hashtag research, and engagement techniques that build a loyal audience.",
        category: "Social Media",
        format: "Video Course",
        imageUrl: "/attached_assets/generated_images/Social_media_ebook_cover_dd9d3045.png",
        price: 4900,
        isFeatured: 0,
      },
      {
        title: "LinkedIn Authority Builder",
        description: "Position yourself as an industry authority on LinkedIn. Master content creation, networking, and lead generation on the world's largest professional network.",
        category: "Social Media",
        format: "Ebook",
        imageUrl: "/attached_assets/generated_images/Leadership_ebook_cover_f73c8e51.png",
        price: 3900,
        isFeatured: 0,
      },
      {
        title: "Digital Product Launch Formula",
        description: "Launch your digital products successfully with proven strategies for pre-launch buzz, launch day execution, and post-launch optimization.",
        category: "Business",
        format: "Video Course",
        imageUrl: "/attached_assets/generated_images/AI_YouTube_course_cover_a3236f2e.png",
        price: 8900,
        isFeatured: 0,
      },
      {
        title: "Affiliate Marketing Profits",
        description: "Build a profitable affiliate marketing business from scratch. Learn niche selection, traffic generation, and conversion optimization strategies.",
        category: "Marketing",
        format: "Ebook",
        imageUrl: "/attached_assets/generated_images/SEO_ebook_product_cover_c299b5a0.png",
        price: 4900,
        isFeatured: 0,
      },
      {
        title: "Webinar Selling Secrets",
        description: "Master the art of webinar selling with proven scripts, slide templates, and closing techniques that consistently convert attendees into customers.",
        category: "Sales",
        format: "Template Pack",
        imageUrl: "/attached_assets/generated_images/Copywriting_ebook_cover_2da2baae.png",
        price: 6900,
        isFeatured: 0,
      },
      {
        title: "Online Course Creation Guide",
        description: "Create and sell profitable online courses. Learn curriculum design, video production, platform selection, and marketing strategies for course creators.",
        category: "Education",
        format: "Video Course",
        imageUrl: "/attached_assets/generated_images/AI_YouTube_course_cover_a3236f2e.png",
        price: 7900,
        isFeatured: 0,
      },
    ];

    productsData.forEach((productData) => {
      const id = randomUUID();
      const product: Product = { 
        ...productData, 
        id,
        isFeatured: productData.isFeatured ?? 0 
      };
      this.products.set(id, product);
    });
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    throw new Error("Purchases not supported in MemStorage");
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    return undefined;
  }

  async getUserPurchases(userId: string): Promise<Purchase[]> {
    return [];
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    throw new Error("Downloads not supported in MemStorage");
  }

  async getPurchaseDownloads(purchaseId: string): Promise<Download[]> {
    return [];
  }

  async createFunnel(funnel: InsertFunnel): Promise<Funnel> {
    throw new Error("Funnels not supported in MemStorage");
  }

  async getFunnel(id: string): Promise<Funnel | undefined> {
    return undefined;
  }

  async getFunnelByEntryProduct(productId: string): Promise<Funnel | undefined> {
    return undefined;
  }

  async updateFunnel(id: string, funnel: Partial<InsertFunnel>): Promise<Funnel | undefined> {
    throw new Error("Funnels not supported in MemStorage");
  }

  async deleteFunnel(id: string): Promise<boolean> {
    throw new Error("Funnels not supported in MemStorage");
  }

  async getAllFunnels(): Promise<Funnel[]> {
    return [];
  }

  async createFunnelStep(step: InsertFunnelStep): Promise<FunnelStep> {
    throw new Error("Funnel steps not supported in MemStorage");
  }

  async getFunnelSteps(funnelId: string): Promise<FunnelStep[]> {
    return [];
  }

  async updateFunnelStep(id: string, step: Partial<InsertFunnelStep>): Promise<FunnelStep | undefined> {
    throw new Error("Funnel steps not supported in MemStorage");
  }

  async deleteFunnelStep(id: string): Promise<boolean> {
    throw new Error("Funnel steps not supported in MemStorage");
  }

  async createOrderBump(bump: InsertOrderBump): Promise<OrderBump> {
    throw new Error("Order bumps not supported in MemStorage");
  }

  async getOrderBumpByProduct(productId: string): Promise<OrderBump | undefined> {
    return undefined;
  }

  async updateOrderBump(id: string, bump: Partial<InsertOrderBump>): Promise<OrderBump | undefined> {
    throw new Error("Order bumps not supported in MemStorage");
  }

  async deleteOrderBump(id: string): Promise<boolean> {
    throw new Error("Order bumps not supported in MemStorage");
  }

  async createFunnelSession(session: InsertFunnelSession): Promise<FunnelSession> {
    throw new Error("Funnel sessions not supported in MemStorage");
  }

  async getFunnelSession(id: string): Promise<FunnelSession | undefined> {
    return undefined;
  }

  async updateFunnelSession(id: string, session: Partial<InsertFunnelSession>): Promise<FunnelSession | undefined> {
    throw new Error("Funnel sessions not supported in MemStorage");
  }

  async getUserFunnelSessions(userId: string): Promise<FunnelSession[]> {
    return [];
  }
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async getAllProducts(): Promise<Product[]> {
    return await this.db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await this.db.select().from(products).where(eq(products.category, category));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await this.db.select().from(products).where(eq(products.isFeatured, 1));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await this.db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const result = await this.db.insert(purchases).values(purchase).returning();
    return result[0];
  }

  async getPurchase(id: string): Promise<Purchase | undefined> {
    const result = await this.db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
    return result[0];
  }

  async getUserPurchases(userId: string): Promise<Purchase[]> {
    return await this.db.select().from(purchases).where(eq(purchases.userId, userId));
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const result = await this.db.insert(downloads).values(download).returning();
    return result[0];
  }

  async getPurchaseDownloads(purchaseId: string): Promise<Download[]> {
    return await this.db.select().from(downloads).where(eq(downloads.purchaseId, purchaseId));
  }

  async createFunnel(funnel: InsertFunnel): Promise<Funnel> {
    const result = await this.db.insert(funnels).values(funnel).returning();
    return result[0];
  }

  async getFunnel(id: string): Promise<Funnel | undefined> {
    const result = await this.db.select().from(funnels).where(eq(funnels.id, id)).limit(1);
    return result[0];
  }

  async getFunnelByEntryProduct(productId: string): Promise<Funnel | undefined> {
    const result = await this.db
      .select()
      .from(funnels)
      .where(eq(funnels.entryProductId, productId))
      .limit(1);
    return result[0];
  }

  async updateFunnel(id: string, funnel: Partial<InsertFunnel>): Promise<Funnel | undefined> {
    const result = await this.db
      .update(funnels)
      .set({ ...funnel, updatedAt: new Date() })
      .where(eq(funnels.id, id))
      .returning();
    return result[0];
  }

  async deleteFunnel(id: string): Promise<boolean> {
    const result = await this.db.delete(funnels).where(eq(funnels.id, id)).returning();
    return result.length > 0;
  }

  async getAllFunnels(): Promise<Funnel[]> {
    return await this.db.select().from(funnels);
  }

  async createFunnelStep(step: InsertFunnelStep): Promise<FunnelStep> {
    const result = await this.db.insert(funnelSteps).values(step).returning();
    return result[0];
  }

  async getFunnelSteps(funnelId: string): Promise<FunnelStep[]> {
    return await this.db.select().from(funnelSteps).where(eq(funnelSteps.funnelId, funnelId));
  }

  async updateFunnelStep(id: string, step: Partial<InsertFunnelStep>): Promise<FunnelStep | undefined> {
    const result = await this.db
      .update(funnelSteps)
      .set(step)
      .where(eq(funnelSteps.id, id))
      .returning();
    return result[0];
  }

  async deleteFunnelStep(id: string): Promise<boolean> {
    const result = await this.db.delete(funnelSteps).where(eq(funnelSteps.id, id)).returning();
    return result.length > 0;
  }

  async createOrderBump(bump: InsertOrderBump): Promise<OrderBump> {
    const result = await this.db.insert(orderBumps).values(bump).returning();
    return result[0];
  }

  async getOrderBumpByProduct(productId: string): Promise<OrderBump | undefined> {
    const result = await this.db
      .select()
      .from(orderBumps)
      .where(eq(orderBumps.productId, productId))
      .limit(1);
    return result[0];
  }

  async updateOrderBump(id: string, bump: Partial<InsertOrderBump>): Promise<OrderBump | undefined> {
    const result = await this.db
      .update(orderBumps)
      .set(bump)
      .where(eq(orderBumps.id, id))
      .returning();
    return result[0];
  }

  async deleteOrderBump(id: string): Promise<boolean> {
    const result = await this.db.delete(orderBumps).where(eq(orderBumps.id, id)).returning();
    return result.length > 0;
  }

  async createFunnelSession(session: InsertFunnelSession): Promise<FunnelSession> {
    const result = await this.db.insert(funnelSessions).values(session).returning();
    return result[0];
  }

  async getFunnelSession(id: string): Promise<FunnelSession | undefined> {
    const result = await this.db.select().from(funnelSessions).where(eq(funnelSessions.id, id)).limit(1);
    return result[0];
  }

  async updateFunnelSession(id: string, session: Partial<InsertFunnelSession>): Promise<FunnelSession | undefined> {
    const result = await this.db
      .update(funnelSessions)
      .set(session)
      .where(eq(funnelSessions.id, id))
      .returning();
    return result[0];
  }

  async getUserFunnelSessions(userId: string): Promise<FunnelSession[]> {
    return await this.db.select().from(funnelSessions).where(eq(funnelSessions.userId, userId));
  }
}

export const storage = new DatabaseStorage();
