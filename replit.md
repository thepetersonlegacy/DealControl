# Digital Product Marketplace Platform

## Overview

This is a digital product marketplace platform built as a modern web application. The platform showcases and sells digital products (ebooks, video courses, templates, etc.) with Private Label Rights (PLR). Users can browse a library of 1000+ done-for-you digital products, view product details, and explore offerings by category. The application emphasizes trust, credibility, and a frictionless browsing experience with a clean, product-first presentation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens

**Design System:**
- Custom color palette supporting light/dark modes with purple accent (#262 83% 58%)
- Typography using Inter font family with defined type scales
- Component variants using class-variance-authority (CVA)
- Custom utility classes for hover/active states (hover-elevate, active-elevate-2)
- Responsive breakpoints and mobile-first design approach

**Key Pages:**
- Home: Hero section, product carousels, feature highlights, testimonials, and CTAs
- Library: Product browsing with search and category filtering
- Product Detail: Individual product information with features and pricing
- 404: Custom not-found page

**Component Architecture:**
- Reusable UI components in `/client/src/components/ui`
- Feature components in `/client/src/components` (Navigation, Footer, HeroSection, etc.)
- Custom hooks in `/client/src/hooks` for mobile detection and toast notifications
- Shared utilities in `/client/src/lib` for class name merging and query client configuration

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **ORM**: Drizzle ORM for type-safe database operations
- **Database Driver**: Neon serverless PostgreSQL driver (@neondatabase/serverless)

**API Design:**
- RESTful API endpoints under `/api` prefix
- Product endpoints:
  - `GET /api/products` - Fetch all products
  - `GET /api/products/featured` - Fetch featured products
  - `GET /api/products/:id` - Fetch single product by ID
  - `GET /api/products/category/:category` - Fetch products by category

**Server Architecture:**
- Express middleware for JSON parsing with raw body verification
- Request/response logging middleware for API endpoints
- Development mode uses Vite middleware for HMR
- Production mode serves static assets from `dist/public`
- Custom error handling and 404 responses

**Storage Layer:**
- In-memory storage implementation (`MemStorage`) for development/testing
- Interface-based design (`IStorage`) allows easy swapping to database implementation
- Product seeding functionality for initial data

### Data Storage Solutions

**Database Schema (PostgreSQL):**
- **Products Table**:
  - `id`: UUID primary key (auto-generated)
  - `title`: Text, required
  - `description`: Text, required
  - `category`: Text, required
  - `format`: Text, required
  - `imageUrl`: Text, required
  - `price`: Integer, required
  - `isFeatured`: Integer (0/1), defaults to 0

- **Users Table**:
  - `id`: UUID primary key (auto-generated)
  - `username`: Text, unique, required
  - `password`: Text, required

**Schema Validation:**
- Drizzle Zod integration for runtime type validation
- Generated insert schemas omit auto-generated fields (id)
- TypeScript inference for type-safe database operations

**Migration Strategy:**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- `db:push` script for applying schema changes

### Authentication and Authorization

**Current State:**
- User schema defined but authentication not yet implemented
- Password field suggests planned password-based authentication
- No session management or JWT implementation visible

**Planned Architecture (Based on Dependencies):**
- Session-based authentication using `connect-pg-simple` for PostgreSQL session store
- User creation and retrieval methods defined in storage interface

### External Dependencies

**UI Component Libraries:**
- **Radix UI**: Accessible, unstyled component primitives
  - Dialog, Dropdown, Popover, Toast, Tooltip, and 20+ other components
  - Ensures accessibility and keyboard navigation
- **shadcn/ui**: Pre-styled component collection built on Radix UI
- **Embla Carousel**: Touch-friendly carousel implementation
- **CMDK**: Command palette component
- **Lucide React**: Icon library

**Development Tools:**
- **Replit Plugins**: Development banner, cartographer, and runtime error modal
- **PostCSS & Autoprefixer**: CSS processing
- **ESBuild**: Server-side bundling for production
- **TSX**: TypeScript execution for development

**Styling:**
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **clsx & tailwind-merge**: Conditional class name utilities

**Data Management:**
- **TanStack Query**: Server state management with caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **date-fns**: Date manipulation utilities

**Database:**
- **Drizzle ORM**: Type-safe SQL query builder
- **Drizzle Kit**: Schema migration tool
- **Neon Serverless**: PostgreSQL driver optimized for serverless environments

**Asset Management:**
- Hero background image stored in `/attached_assets/generated_images/`
- Favicon and fonts loaded from static assets or CDN (Google Fonts)