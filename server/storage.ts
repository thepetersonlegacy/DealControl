import { type User, type UpsertUser, type Product, type InsertProduct, type Purchase, type InsertPurchase, type Download, type InsertDownload, products, users, purchases, downloads } from "@shared/schema";
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
  getUserPurchases(userId: string): Promise<Purchase[]>;
  
  createDownload(download: InsertDownload): Promise<Download>;
  getPurchaseDownloads(purchaseId: string): Promise<Download[]>;
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

  async getUserPurchases(userId: string): Promise<Purchase[]> {
    return [];
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    throw new Error("Downloads not supported in MemStorage");
  }

  async getPurchaseDownloads(purchaseId: string): Promise<Download[]> {
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
}

export const storage = new DatabaseStorage();
