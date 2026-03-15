# LotusDelivery - Food Delivery Web Application

## Overview

LotusDelivery is a full-stack food delivery web application where users can browse restaurants, view menus, add items to a cart, place orders, and track order history. The app follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database. Authentication is handled via Replit's OpenID Connect (OIDC) integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure

The project is organized into three main directories:

- **`client/`** — React frontend (SPA)
- **`server/`** — Express backend (API server)
- **`shared/`** — Shared code between client and server (schema, routes, types)

### Frontend Architecture

- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with pages: Home, Grocery, RestaurantDetails, Orders, Admin
- **State Management**: 
  - Server state: TanStack React Query for API data fetching and caching
  - Cart state: Zustand with localStorage persistence (`use-cart.tsx`)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming. Uses "DM Sans" for body text and "Outfit" for display/headings. Warm orange-red color palette designed for food delivery branding.
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture

- **Framework**: Express.js running on Node.js with TypeScript (executed via `tsx`)
- **API Design**: RESTful JSON API under `/api/` prefix. Routes are defined in `shared/routes.ts` with Zod schemas for validation, then implemented in `server/routes.ts`
- **Development**: Vite dev server with HMR is integrated as Express middleware during development (`server/vite.ts`)
- **Production**: Client is built to `dist/public/`, server is bundled with esbuild to `dist/index.cjs`, and static files are served by Express (`server/static.ts`)
- **Build Script**: Custom build in `script/build.ts` that runs Vite build for client and esbuild for server, with an allowlist of dependencies to bundle for faster cold starts

### Database

- **Database**: PostgreSQL (required, via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-Zod type generation
- **Schema Location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Migrations**: Drizzle Kit with `drizzle-kit push` command (`npm run db:push`)
- **Tables**:
  - `users` — User accounts (managed by Replit Auth, includes `isAdmin` boolean field)
  - `sessions` — Session storage for express-session (managed by connect-pg-simple)
  - `restaurants` — Restaurant listings with name, description, address, image, rating, type (restaurant/grocery)
  - `menu_items` — Menu items belonging to restaurants, with prices stored in cents
  - `orders` — User orders with status tracking (pending, preparing, delivering, delivered)
  - `order_items` — Individual items within an order with quantity and price snapshot
- **Storage Pattern**: `server/storage.ts` implements an `IStorage` interface with a `DatabaseStorage` class, providing a clean abstraction layer over the database

### Authentication & Authorization

- **Method**: Replit Auth via OpenID Connect (OIDC)
- **Session Storage**: PostgreSQL-backed sessions via `connect-pg-simple`
- **Library**: Passport.js with `openid-client/passport` strategy
- **Flow**: Login redirects to `/api/login`, logout via `/api/logout`, user info at `/api/auth/user`
- **Middleware**: `isAuthenticated` middleware protects routes requiring login; `isAdmin` middleware protects admin routes
- **User Management**: Users are upserted on login (created if new, updated if returning). `isAdmin` flag preserved on re-login.
- **Admin Access**: Users with `isAdmin=true` can access `/admin` dashboard. Set via database: `UPDATE users SET is_admin = true WHERE id = '...'`
- **Required Environment Variables**: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID`, `ISSUER_URL`

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/restaurants` | No | List all restaurants |
| GET | `/api/restaurants/:id` | No | Get restaurant with menu items |
| POST | `/api/orders` | Yes | Create a new order |
| GET | `/api/orders` | Yes | List user's orders |
| GET | `/api/auth/user` | Yes | Get current user info |
| POST | `/api/admin/restaurants` | Admin | Create restaurant |
| PUT | `/api/admin/restaurants/:id` | Admin | Update restaurant |
| DELETE | `/api/admin/restaurants/:id` | Admin | Delete restaurant + menu items |
| POST | `/api/admin/menu-items` | Admin | Create menu item |
| PUT | `/api/admin/menu-items/:id` | Admin | Update menu item |
| DELETE | `/api/admin/menu-items/:id` | Admin | Delete menu item |
| GET | `/api/admin/orders` | Admin | List all orders |
| PATCH | `/api/admin/orders/:id/status` | Admin | Update order status |

### Shared Route Definitions

Routes are defined centrally in `shared/routes.ts` with Zod schemas for input validation and response types. Both client and server import from this file, ensuring type safety across the stack.

### Database Seeding

The server seeds the database with sample restaurant and menu item data on startup (called in `registerRoutes`).

## External Dependencies

- **PostgreSQL** — Primary database (must be provisioned, connection via `DATABASE_URL`)
- **Replit Auth (OIDC)** — Authentication provider using OpenID Connect
- **Google Fonts** — DM Sans, Outfit, Fira Code, Geist Mono, Architects Daughter
- **Unsplash** — Restaurant and food images (referenced in image URLs)
- **Key npm packages**:
  - `drizzle-orm` + `drizzle-kit` — Database ORM and migrations
  - `express` + `express-session` — HTTP server and session management
  - `passport` + `openid-client` — Authentication
  - `connect-pg-simple` — PostgreSQL session store
  - `@tanstack/react-query` — Server state management
  - `zustand` — Client state management (cart)
  - `wouter` — Client-side routing
  - `framer-motion` — Animations
  - `zod` — Schema validation
  - `shadcn/ui` components (Radix UI + Tailwind)