import ws from "ws";
import { DatabaseStorage } from "./storage.js";
import type { InsertProduct, InsertFunnel, InsertFunnelStep, InsertOrderBump } from "@shared/schema";

// Polyfill WebSocket for Neon serverless
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws as any;
}

const storage = new DatabaseStorage();

// Original Digital Marketing Products
const originalProducts: InsertProduct[] = [
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
    isFeatured: 0,
  },
  {
    title: "Leadership Communication Skills",
    description: "Develop powerful communication skills that inspire teams, influence stakeholders, and position you as a confident leader in any organization.",
    category: "Leadership",
    format: "Ebook",
    imageUrl: "/attached_assets/generated_images/Leadership_ebook_cover_f73c8e51.png",
    price: 4500,
    isFeatured: 0,
  },
  {
    title: "AI YouTube Growth Strategy",
    description: "Leverage AI tools to create viral YouTube content, optimize your channel, and grow your subscriber base using cutting-edge automation and data-driven strategies.",
    category: "Content Creation",
    format: "Video Course",
    imageUrl: "/attached_assets/generated_images/AI_YouTube_course_cover_a3236f2e.png",
    price: 7900,
    isFeatured: 0,
  },
  {
    title: "Copywriting Mastery Blueprint",
    description: "Write compelling copy that converts browsers into buyers. Master persuasive writing techniques used by top copywriters to create sales pages, ads, and email campaigns.",
    category: "Copywriting",
    format: "Ebook",
    imageUrl: "/attached_assets/generated_images/Copywriting_ebook_cover_2da2baae.png",
    price: 5900,
    isFeatured: 0,
  },
  {
    title: "Social Media Marketing Pro",
    description: "Build a powerful social media presence across all platforms. Learn content strategies, engagement tactics, and paid advertising methods that generate real business results.",
    category: "Marketing",
    format: "Video Course",
    imageUrl: "/attached_assets/generated_images/AI_YouTube_course_cover_a3236f2e.png",
    price: 6900,
    isFeatured: 0,
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
];

// Texas Real Estate Products - Tier 1: Immediate Pain / Legal or Money Risk
const texasRealEstateTier1: InsertProduct[] = [
  {
    title: "Texas Executor Property Sale Checklist",
    description: "Complete step-by-step checklist for selling estate property in Texas. Covers court requirements, heir notifications, title clearance, and timeline management. Prevents costly legal mistakes and delays.",
    category: "Real Estate",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/estate_probate_legal_cover.png",
    price: 5900,
    isFeatured: 1,
  },
  {
    title: "Earnest Money Dispute Prevention SOP",
    description: "Protect earnest money deposits and avoid disputes before they happen. Covers Texas-specific contract language, documentation requirements, and escalation procedures that keep deals on track.",
    category: "Real Estate",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/texas_real_estate_transaction_cover.png",
    price: 4900,
    isFeatured: 1,
  },
  {
    title: "First-Time Landlord Mistake Prevention SOP",
    description: "Avoid the 15 most expensive mistakes new landlords make. Covers tenant screening, lease terms, security deposits, and maintenance protocols that protect your investment from day one.",
    category: "Landlord",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/landlord_property_management_cover.png",
    price: 3900,
    isFeatured: 1,
  },
  {
    title: "Heir Interference Prevention SOP",
    description: "Navigate family dynamics during estate property sales. Documented procedures for communication, decision-making authority, and conflict resolution that keep sales moving forward.",
    category: "Real Estate",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/estate_probate_legal_cover.png",
    price: 4900,
    isFeatured: 1,
  },
  {
    title: "Mortgage Loan Fallout Prevention Checklist",
    description: "Stop financing issues before they kill your deal. Pre-qualification verification, documentation requirements, and backup plan strategies that ensure closings happen on schedule.",
    category: "Real Estate",
    format: "Checklist",
    imageUrl: "/attached_assets/generated_images/texas_real_estate_transaction_cover.png",
    price: 4900,
    isFeatured: 1,
  },
  {
    title: "Buyer Credit Readiness Pre-Screen SOP",
    description: "Screen buyer financing before investing time in showings. Credit score requirements, debt-to-income calculations, and pre-approval verification procedures that save weeks of wasted effort.",
    category: "Real Estate",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/client_onboarding_cover.png",
    price: 3900,
    isFeatured: 1,
  },
  {
    title: "Inspection Objection Negotiation Script",
    description: "Word-for-word scripts for handling inspection objections. Covers major vs minor repairs, credit vs repair negotiations, and deal-saving language that protects your commission.",
    category: "Real Estate",
    format: "Script Template",
    imageUrl: "/attached_assets/generated_images/sales_negotiation_cover.png",
    price: 4900,
    isFeatured: 0,
  },
  {
    title: "Appraisal Gap Strategy Guide",
    description: "Navigate low appraisals without losing deals. Price adjustment strategies, gap financing options, and negotiation tactics that keep transactions together when values fall short.",
    category: "Real Estate",
    format: "Strategy Guide",
    imageUrl: "/attached_assets/generated_images/sales_negotiation_cover.png",
    price: 5900,
    isFeatured: 0,
  },
  {
    title: "Financing Fallout Response Playbook",
    description: "Rescue deals when financing falls through. Emergency lender contacts, backup financing strategies, and timeline extension procedures that save transactions at the last minute.",
    category: "Real Estate",
    format: "Playbook",
    imageUrl: "/attached_assets/generated_images/texas_real_estate_transaction_cover.png",
    price: 5900,
    isFeatured: 0,
  },
  {
    title: "Divorce-Related Property Sale Playbook",
    description: "Manage high-emotion divorce property sales professionally. Communication protocols, neutral party procedures, and documentation requirements that protect all parties and your license.",
    category: "Real Estate",
    format: "Playbook",
    imageUrl: "/attached_assets/generated_images/estate_probate_legal_cover.png",
    price: 6900,
    isFeatured: 0,
  },
];

// Texas Real Estate Products - Tier 2: Operational Stress & Reputation Protection
const texasRealEstateTier2: InsertProduct[] = [
  {
    title: "New Client Intake SOP (Buyer)",
    description: "Streamlined buyer onboarding that sets expectations from day one. Covers needs assessment, timeline setting, financing verification, and communication preferences that reduce future problems.",
    category: "Real Estate",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/client_onboarding_cover.png",
    price: 3900,
    isFeatured: 0,
  },
  {
    title: "New Client Intake SOP (Seller)",
    description: "Professional seller onboarding that positions you as the expert. Covers property evaluation, pricing strategy, timeline expectations, and marketing plan presentation.",
    category: "Real Estate",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/client_onboarding_cover.png",
    price: 3900,
    isFeatured: 0,
  },
  {
    title: "Client Expectation Alignment Script",
    description: "Set realistic expectations before problems arise. Word-for-word scripts for discussing market conditions, timelines, pricing, and what clients can expect throughout the transaction.",
    category: "Real Estate",
    format: "Script Template",
    imageUrl: "/attached_assets/generated_images/sales_negotiation_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Transaction Timeline Communication Template",
    description: "Keep clients informed without constant phone calls. Pre-written milestone updates, status reports, and proactive communication templates that build trust and reduce anxiety.",
    category: "Real Estate",
    format: "Template Pack",
    imageUrl: "/attached_assets/generated_images/client_onboarding_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Seller Readiness Reality Check Checklist",
    description: "Identify tire-kickers vs serious sellers before investing time. Motivation assessment, timeline verification, and pricing reality checks that qualify listings worth taking.",
    category: "Real Estate",
    format: "Checklist",
    imageUrl: "/attached_assets/generated_images/texas_real_estate_transaction_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Tenant Screening Compliance Checklist (TX)",
    description: "Screen tenants legally and effectively under Texas law. Application requirements, background check procedures, and fair housing compliance that protect you from discrimination claims.",
    category: "Landlord",
    format: "Checklist",
    imageUrl: "/attached_assets/generated_images/landlord_property_management_cover.png",
    price: 3900,
    isFeatured: 0,
  },
  {
    title: "Security Deposit Handling SOP",
    description: "Handle security deposits by the book under Texas Property Code. Collection, holding, documentation, and return procedures that prevent lawsuits and protect your reputation.",
    category: "Landlord",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/landlord_property_management_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Lease Violation Documentation Checklist",
    description: "Document violations properly for enforcement or eviction. Notice requirements, photo documentation standards, and timeline tracking that hold up in Texas courts.",
    category: "Landlord",
    format: "Checklist",
    imageUrl: "/attached_assets/generated_images/landlord_property_management_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Vacant Property Risk Mitigation Checklist",
    description: "Protect vacant properties from damage, liability, and insurance issues. Security measures, utility management, and inspection schedules that prevent costly surprises.",
    category: "Landlord",
    format: "Checklist",
    imageUrl: "/attached_assets/generated_images/landlord_property_management_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Out-of-State Executor Coordination SOP",
    description: "Manage estate sales when the executor is remote. Communication protocols, local vendor coordination, and decision-making procedures that keep transactions moving despite distance.",
    category: "Real Estate",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/estate_probate_legal_cover.png",
    price: 4900,
    isFeatured: 0,
  },
];

// Texas Real Estate Products - Tier 3: Quiet Upsells & Bundling Gold
const texasRealEstateTier3: InsertProduct[] = [
  {
    title: "Multiple Offer Handling Checklist",
    description: "Manage multiple offers professionally and legally. Presentation procedures, seller consultation scripts, and documentation requirements that protect all parties.",
    category: "Real Estate",
    format: "Checklist",
    imageUrl: "/attached_assets/generated_images/sales_negotiation_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Backup Offer Management SOP",
    description: "Keep backup offers engaged and ready to activate. Communication templates, timeline management, and activation procedures that save deals when primaries fall through.",
    category: "Real Estate",
    format: "SOP Document",
    imageUrl: "/attached_assets/generated_images/texas_real_estate_transaction_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Price Reduction Decision Framework",
    description: "Data-driven approach to price reductions that sellers accept. Market analysis presentation, timing recommendations, and conversation scripts that move stale listings.",
    category: "Real Estate",
    format: "Strategy Guide",
    imageUrl: "/attached_assets/generated_images/sales_negotiation_cover.png",
    price: 3900,
    isFeatured: 0,
  },
  {
    title: "Days-on-Market Reset Playbook",
    description: "Strategic approaches to resetting DOM without looking desperate. Timing strategies, listing modifications, and marketing refresh techniques that attract fresh buyer attention.",
    category: "Real Estate",
    format: "Playbook",
    imageUrl: "/attached_assets/generated_images/texas_real_estate_transaction_cover.png",
    price: 3900,
    isFeatured: 0,
  },
  {
    title: "Seller Emotional Expectation Management Script",
    description: "Navigate emotional sellers with professionalism. Scripts for pricing reality, showing feedback, and market condition discussions that maintain relationships while speaking truth.",
    category: "Real Estate",
    format: "Script Template",
    imageUrl: "/attached_assets/generated_images/sales_negotiation_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Mortgage Denial Recovery Playbook",
    description: "Help buyers bounce back from denial and find alternative paths to ownership. Lender referrals, credit repair timelines, and alternative financing options.",
    category: "Real Estate",
    format: "Playbook",
    imageUrl: "/attached_assets/generated_images/texas_real_estate_transaction_cover.png",
    price: 3900,
    isFeatured: 0,
  },
  {
    title: "FSBO Rescue Agent Playbook",
    description: "Convert frustrated FSBO sellers into listings. Timing strategies, value proposition scripts, and objection handling that wins listings from failed DIY attempts.",
    category: "Real Estate",
    format: "Playbook",
    imageUrl: "/attached_assets/generated_images/sales_negotiation_cover.png",
    price: 4900,
    isFeatured: 0,
  },
  {
    title: "Investor Deal Kill-Criteria Checklist",
    description: "Quickly identify deals not worth pursuing. ROI calculations, risk assessments, and red flag identification that saves time on unprofitable opportunities.",
    category: "Real Estate",
    format: "Checklist",
    imageUrl: "/attached_assets/generated_images/texas_real_estate_transaction_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Contractor Scope Control Checklist",
    description: "Prevent scope creep and budget overruns on renovation projects. Written scope requirements, change order procedures, and payment milestone structures.",
    category: "Real Estate",
    format: "Checklist",
    imageUrl: "/attached_assets/generated_images/landlord_property_management_cover.png",
    price: 2900,
    isFeatured: 0,
  },
  {
    title: "Vacant Property Lockdown Checklist",
    description: "Secure vacant properties against theft, vandalism, and liability. Security measures, neighbor notification, and monitoring procedures for extended vacancies.",
    category: "Landlord",
    format: "Checklist",
    imageUrl: "/attached_assets/generated_images/landlord_property_management_cover.png",
    price: 2900,
    isFeatured: 0,
  },
];

// Premium Bundle Products
const bundleProducts: InsertProduct[] = [
  // Transaction Risk Control Kit
  {
    title: "Transaction Risk Control Kit - Solo",
    description: "Essential transaction protection for individual agents. Includes Earnest Money Dispute Prevention SOP, Financing Fallout Response Playbook, and Inspection Objection Negotiation Script. Use this before your broker has to get involved.",
    category: "Bundle",
    format: "Bundle Pack",
    imageUrl: "/attached_assets/generated_images/premium_bundle_package_cover.png",
    price: 6900,
    isFeatured: 1,
  },
  {
    title: "Transaction Risk Control Kit - Pro",
    description: "Complete transaction protection for power agents and team leads. Everything in Solo plus Appraisal Gap Strategy Guide, Client Expectation Alignment Script, Transaction Timeline Communication Template, and Buyer Credit Readiness Pre-Screen SOP. Includes editable client-facing PDFs.",
    category: "Bundle",
    format: "Bundle Pack",
    imageUrl: "/attached_assets/generated_images/premium_bundle_package_cover.png",
    price: 17900,
    isFeatured: 0,
  },
  {
    title: "Transaction Risk Control Kit - Office License",
    description: "Enterprise-grade transaction protection for brokerages. All Pro assets with white-label rights for internal use, broker compliance disclaimer pages, and office-wide SOP adoption guide. Annual license for unlimited agents.",
    category: "Bundle",
    format: "Office License",
    imageUrl: "/attached_assets/generated_images/premium_bundle_package_cover.png",
    price: 54900,
    isFeatured: 0,
  },
  // Landlord & Rental Liability Shield
  {
    title: "Landlord Liability Shield - Solo",
    description: "Essential protection for new landlords. Includes First-Time Landlord Mistake Prevention SOP, Tenant Screening Compliance Checklist, and Security Deposit Handling SOP. Avoid the expensive mistakes before they happen.",
    category: "Bundle",
    format: "Bundle Pack",
    imageUrl: "/attached_assets/generated_images/premium_bundle_package_cover.png",
    price: 5900,
    isFeatured: 0,
  },
  {
    title: "Landlord Liability Shield - Pro",
    description: "Complete landlord protection system. Everything in Solo plus Lease Violation Documentation Checklist, Vacant Property Risk Mitigation Checklist, and Maintenance Request Response procedures. For serious property investors.",
    category: "Bundle",
    format: "Bundle Pack",
    imageUrl: "/attached_assets/generated_images/premium_bundle_package_cover.png",
    price: 15900,
    isFeatured: 0,
  },
  {
    title: "Landlord Liability Shield - Office License",
    description: "Property management firm protection package. All Pro assets with editable lease addendum language, property manager onboarding checklist, and annual compliance update templates. White-label for internal use.",
    category: "Bundle",
    format: "Office License",
    imageUrl: "/attached_assets/generated_images/premium_bundle_package_cover.png",
    price: 49900,
    isFeatured: 0,
  },
  // Estate & Court Sale Control Pack
  {
    title: "Estate Sale Control Pack - Solo",
    description: "Essential estate property sale toolkit. Includes Texas Executor Property Sale Checklist, Probate Timeline Expectation Guide, and Estate Sale Documentation Organizer. Navigate probate sales with confidence.",
    category: "Bundle",
    format: "Bundle Pack",
    imageUrl: "/attached_assets/generated_images/premium_bundle_package_cover.png",
    price: 7900,
    isFeatured: 0,
  },
  {
    title: "Estate Sale Control Pack - Pro",
    description: "Complete estate sale management system. Everything in Solo plus Heir Interference Prevention SOP, Probate Property Lockdown Checklist, and Executor-Agent Communication Scripts. For agents specializing in estate sales.",
    category: "Bundle",
    format: "Bundle Pack",
    imageUrl: "/attached_assets/generated_images/premium_bundle_package_cover.png",
    price: 21900,
    isFeatured: 0,
  },
  {
    title: "Estate Sale Control Pack - Office License",
    description: "Law firm and brokerage estate sale package. All Pro assets with court-facing compliance checklists, attorney collaboration SOP, and risk disclaimer templates. Trusted by attorneys and executors alike.",
    category: "Bundle",
    format: "Office License",
    imageUrl: "/attached_assets/generated_images/premium_bundle_package_cover.png",
    price: 79900,
    isFeatured: 0,
  },
];

// Combine all products
const productsData: InsertProduct[] = [
  ...originalProducts,
  ...texasRealEstateTier1,
  ...texasRealEstateTier2,
  ...texasRealEstateTier3,
  ...bundleProducts,
];

async function seed() {
  console.log("Starting database seed...");
  
  let existingProducts = await storage.getAllProducts();
  
  if (existingProducts.length === 0) {
    for (const product of productsData) {
      await storage.createProduct(product);
    }
    console.log(`Successfully seeded ${productsData.length} products!`);
    existingProducts = await storage.getAllProducts();
  } else {
    console.log(`Database already has ${existingProducts.length} products.`);
  }

  // Check if funnels already exist
  const existingFunnels = await storage.getAllFunnels();
  if (existingFunnels.length > 0) {
    console.log(`Database already has ${existingFunnels.length} funnels. Skipping funnel seed.`);
    process.exit(0);
    return;
  }

  // Seed sample funnel data
  const firstProduct = existingProducts.find(p => p.title.includes("SEO")) || existingProducts[0];
  const secondProduct = existingProducts.find(p => p.title.includes("Email Marketing")) || existingProducts[1];
  const thirdProduct = existingProducts.find(p => p.title.includes("Leadership")) || existingProducts[2];
  const fourthProduct = existingProducts.find(p => p.title.includes("AI YouTube") || p.title.includes("YouTube")) || existingProducts[3];

  // Create a sample funnel tied to the first product
  const funnel = await storage.createFunnel({
    name: "SEO Mastery Upsell Funnel",
    description: "Post-purchase funnel for SEO Mastery Guide with upsells and downsells",
    entryProductId: firstProduct.id,
    isActive: 1,
  });

  console.log(`Created funnel: ${funnel.name}`);

  // Create funnel steps: 1 upsell and 1 downsell
  const upsellStep = await storage.createFunnelStep({
    funnelId: funnel.id,
    stepType: "upsell",
    offerProductId: fourthProduct.id, // AI YouTube Growth Strategy - premium upsell
    priority: 1,
    priceOverride: 4900, // Special discounted price (normally $79)
    headline: "Wait! Supercharge Your Growth with AI-Powered YouTube Strategies",
    subheadline: "Combine SEO mastery with YouTube to dominate search AND video. Get 38% off today only!",
    ctaText: "Yes! Add AI YouTube Strategy for Just $49",
    declineText: "No thanks, I'll stick with SEO only",
    timerSeconds: 900, // 15 minute timer
    isActive: 1,
  });

  console.log(`Created upsell step: ${upsellStep.headline}`);

  const downsellStep = await storage.createFunnelStep({
    funnelId: funnel.id,
    stepType: "downsell",
    offerProductId: secondProduct.id, // Email Marketing Mastery - lower priced downsell
    priority: 2,
    priceOverride: 1900, // Special discounted price (normally $39)
    headline: "How About Email Marketing Instead?",
    subheadline: "Get our Email Marketing Mastery guide at over 50% off. Perfect for driving traffic from your SEO efforts!",
    ctaText: "Yes! I Want Email Marketing for $19",
    declineText: "No thanks, I'm all set",
    timerSeconds: 600, // 10 minute timer
    isActive: 1,
  });

  console.log(`Created downsell step: ${downsellStep.headline}`);

  // Create an order bump for the first product
  const orderBump = await storage.createOrderBump({
    productId: firstProduct.id,
    bumpProductId: thirdProduct.id, // Leadership Communication Skills
    bumpPrice: 1900, // Special bump price (normally $45)
    headline: "Add Leadership Communication Skills!",
    description: "Master the art of communicating your SEO insights to stakeholders and clients. Just $19 when you add it now!",
    isActive: 1,
  });

  console.log(`Created order bump for ${firstProduct.title}`);
  console.log("Funnel data seeding complete!");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
