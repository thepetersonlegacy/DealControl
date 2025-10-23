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
- Authentication endpoints:
  - `GET /api/login` - Initiate Replit Auth login flow
  - `GET /api/logout` - Log out and redirect to Replit logout
  - `GET /api/callback` - OAuth callback handler
  - `GET /api/auth/user` - Get current authenticated user (protected)
- Product endpoints:
  - `GET /api/products` - Fetch all products (public)
  - `GET /api/products/featured` - Fetch featured products (public)
  - `GET /api/products/:id` - Fetch single product by ID (public)
  - `GET /api/products/category/:category` - Fetch products by category (public)

**Server Architecture:**
- Express middleware for JSON parsing with raw body verification
- Request/response logging middleware for API endpoints
- Development mode uses Vite middleware for HMR
- Production mode serves static assets from `dist/public`
- Custom error handling and 404 responses

**Storage Layer:**
- PostgreSQL database with DatabaseStorage implementation (production-ready)
- Interface-based design (`IStorage`) allows easy swapping between implementations
- Product seeding functionality with 16 pre-loaded products
- MemStorage class available for testing purposes

### Data Storage Solutions

**Database Schema (PostgreSQL):**
- **Products Table**:
  - `id`: UUID primary key (auto-generated)
  - `title`: Text, required
  - `description`: Text, required
  - `category`: Text, required
  - `format`: Text, required
  - `imageUrl`: Text, required
  - `price`: Integer (cents), required
  - `isFeatured`: Integer (0/1), defaults to 0

- **Users Table** (Replit Auth):
  - `id`: Varchar primary key (from Replit Auth)
  - `email`: Varchar, unique
  - `firstName`: Varchar
  - `lastName`: Varchar
  - `profileImageUrl`: Varchar
  - `createdAt`: Timestamp with default
  - `updatedAt`: Timestamp with default

- **Sessions Table** (Replit Auth):
  - `sid`: Varchar primary key
  - `sess`: JSONB, required
  - `expire`: Timestamp, required, indexed

- **Purchases Table**:
  - `id`: UUID primary key (auto-generated)
  - `userId`: Varchar, FK to users.id
  - `productId`: UUID, FK to products.id
  - `amount`: Integer (cents), required
  - `stripePaymentId`: Text (nullable)
  - `purchasedAt`: Timestamp with default

- **Downloads Table**:
  - `id`: UUID primary key (auto-generated)
  - `purchaseId`: UUID, FK to purchases.id
  - `downloadedAt`: Timestamp with default

**Schema Validation:**
- Drizzle Zod integration for runtime type validation
- Generated insert schemas omit auto-generated fields (id)
- TypeScript inference for type-safe database operations

**Migration Strategy:**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- `db:push` script for applying schema changes

### Authentication and Authorization

**Replit Auth Integration (OpenID Connect):**
- **Provider**: Replit as OpenID Connect provider
- **Supported Login Methods**: Google, GitHub, X (Twitter), Apple, Email/Password
- **Session Management**: PostgreSQL-backed sessions via `connect-pg-simple`
- **Session Duration**: 7 days
- **Token Refresh**: Automatic token refresh using refresh tokens

**Implementation Details:**
- **Backend**: `server/replitAuth.ts` handles OAuth flow, session management, and token refresh
- **Frontend**: `useAuth()` hook provides authentication state across all components
- **Protected Routes**: `isAuthenticated` middleware protects endpoints requiring login
- **User Storage**: Automatic user upsert on login with Replit profile data

**Authentication Flow:**
1. User clicks "Log In" → Redirected to `/api/login`
2. Replit handles authentication (user chooses login method)
3. OAuth callback to `/api/callback` → Creates/updates user in database
4. Session created and user redirected to home or original destination
5. Frontend `useAuth()` hook fetches user data from `/api/auth/user`

**Frontend Auth Hooks:**
- `useAuth()`: Returns `{ user, isLoading, isAuthenticated }`
- `isUnauthorizedError()`: Helper to detect 401 errors and redirect to login

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