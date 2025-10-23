import ws from "ws";
import { DatabaseStorage } from "./storage.js";
import type { InsertProduct } from "@shared/schema";

// Polyfill WebSocket for Neon serverless
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws as any;
}

const storage = new DatabaseStorage();

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
    imageUrl: "/attached_assets/generated_images/AI_YouTube_course_cover_a3236f2e.png",
    price: 6900,
    isFeatured: 1,
  },
  {
    title: "High Ticket Sales Mastery",
    description: "Close premium sales with confidence. Master the psychology, scripts, and objection-handling techniques that top salespeople use to sell high-value products and services.",
    category: "Sales",
    format: "Ebook",
    imageUrl: "/attached_assets/generated_images/Copywriting_ebook_cover_2da2baae.png",
    price: 8900,
    isFeatured: 0,
  },
  {
    title: "Productivity Hacks Collection",
    description: "Maximize your output with proven productivity systems, time management techniques, and automation tools used by high performers to achieve more in less time.",
    category: "Business",
    format: "Ebook",
    imageUrl: "/attached_assets/generated_images/Leadership_ebook_cover_f73c8e51.png",
    price: 3900,
    isFeatured: 0,
  },
  {
    title: "Instagram Influence Blueprint",
    description: "Build a loyal Instagram following and monetize your influence. Learn content creation, engagement strategies, and partnership opportunities that generate income.",
    category: "Content Creation",
    format: "Video Course",
    imageUrl: "/attached_assets/generated_images/Email_marketing_ebook_cover_0ac56840.png",
    price: 5900,
    isFeatured: 0,
  },
  {
    title: "Brand Design Essentials",
    description: "Create a professional brand identity from scratch. Master logo design, color psychology, typography, and brand guidelines that make your business stand out.",
    category: "Design",
    format: "Template Pack",
    imageUrl: "/attached_assets/generated_images/SEO_ebook_product_cover_c299b5a0.png",
    price: 4900,
    isFeatured: 0,
  },
  {
    title: "Funnel Building Masterclass",
    description: "Design and build high-converting sales funnels that turn cold traffic into paying customers. Includes templates, swipe files, and implementation strategies.",
    category: "Marketing",
    format: "Video Course",
    imageUrl: "/attached_assets/generated_images/AI_YouTube_course_cover_a3236f2e.png",
    price: 7900,
    isFeatured: 0,
  },
  {
    title: "Podcast Launch Guide",
    description: "Start and grow a successful podcast from scratch. Learn equipment setup, content planning, editing, distribution, and monetization strategies for podcasters.",
    category: "Content Creation",
    format: "Ebook",
    imageUrl: "/attached_assets/generated_images/Leadership_ebook_cover_f73c8e51.png",
    price: 4900,
    isFeatured: 0,
  },
  {
    title: "LinkedIn Authority Builder",
    description: "Establish yourself as a thought leader on LinkedIn. Master profile optimization, content creation, networking strategies, and lead generation techniques.",
    category: "Marketing",
    format: "Ebook",
    imageUrl: "/attached_assets/generated_images/Email_marketing_ebook_cover_0ac56840.png",
    price: 3900,
    isFeatured: 0,
  },
  {
    title: "Amazon FBA Success Blueprint",
    description: "Build a profitable Amazon business selling physical products. Learn product research, supplier negotiations, listing optimization, and PPC advertising strategies.",
    category: "Business",
    format: "Video Course",
    imageUrl: "/attached_assets/generated_images/Copywriting_ebook_cover_2da2baae.png",
    price: 8900,
    isFeatured: 0,
  },
  {
    title: "Affiliate Marketing Profits",
    description: "Generate passive income through affiliate marketing. Learn niche selection, traffic generation, product promotion, and scaling strategies that create recurring revenue.",
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
];

async function seed() {
  console.log("Starting database seed...");
  
  const existing = await storage.getAllProducts();
  if (existing.length > 0) {
    console.log(`Database already has ${existing.length} products. Skipping seed.`);
    return;
  }

  for (const product of productsData) {
    await storage.createProduct(product);
  }

  console.log(`Successfully seeded ${productsData.length} products!`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
