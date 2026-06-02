# StockFlow

A multi-tenant SaaS inventory management system. Each organisation gets its own isolated workspace to track products, monitor stock levels, and get alerted when items run low.

**Live demo:** https://stockflow-roan.vercel.app

[![CI](https://github.com/omkarsunildhapte/StockFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/omkarsunildhapte/StockFlow/actions/workflows/ci.yml)

---

## Features

- **Authentication** — Signup, login, and logout with HttpOnly JWT cookies. Unauthenticated requests are redirected server-side via Next.js Middleware.
- **Multi-tenancy** — Every user belongs to an organisation. All data (products, settings) is scoped to that org; no cross-tenant data leaks.
- **Product CRUD** — Create, edit, and delete products with Name, SKU, Quantity, Cost Price, Selling Price, and a per-product low-stock threshold.
- **Search** — Real-time product search by name or SKU on the products list.
- **Dashboard** — Stat cards for total products and total units in stock. A low-stock table highlights every product below its threshold with a direct link to edit it.
- **Settings** — Per-org default low-stock threshold that pre-fills the value when creating new products.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL via [Supabase](https://supabase.com) |
| ORM | Prisma 5 |
| Auth | JWT (`jose`) + bcryptjs, HttpOnly cookies |
| Styling | Tailwind CSS v4 |
| Testing | Playwright (30 e2e tests) |
| CI/CD | GitHub Actions → Vercel |

---

## Local setup

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local or [Supabase free tier](https://supabase.com))

### 1. Clone and install

```bash
git clone https://github.com/omkarsunildhapte/StockFlow.git
cd StockFlow
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# Any long random string — used to sign JWTs
JWT_SECRET="your-secret-key-here"

# Supabase project credentials (optional — only needed if using Supabase client features)
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up to create your first organisation.

---

## Running tests

The test suite uses Playwright and requires a running dev server and a database.

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Start the dev server in one terminal
npm run dev

# Run all 30 e2e tests in another terminal
npx playwright test

# Open the HTML report after a run
npx playwright show-report
```

---

## Project structure

```
app/
  (auth)/         # Login and signup pages
  (app)/          # Protected pages: dashboard, products, settings
  api/            # Route handlers (auth, products, dashboard, settings)
  page.tsx        # Root redirect
components/
  ProductForm.tsx # Shared create/edit form
lib/
  jwt.ts          # jose-based sign/verify (Edge Runtime compatible)
  auth.ts         # getAuthUser helper for API routes
  prisma.ts       # Prisma client singleton
  supabase.ts     # Supabase client
middleware.ts     # Server-side auth guard (runs in Edge Runtime)
prisma/
  schema.prisma   # Organization, User, Product, OrgSettings models
tests/
  auth.spec.ts
  products.spec.ts
  dashboard.spec.ts
  settings.spec.ts
  helpers.ts
```

---

## CI/CD

Every push to `master` runs two GitHub Actions jobs:

1. **Lint & Build** — TypeScript type check + `next build`
2. **Playwright E2E** — spins up a local PostgreSQL container, pushes the schema, and runs all 30 tests against the dev server

On success the build is automatically deployed to Vercel.
