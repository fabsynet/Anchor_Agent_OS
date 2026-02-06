# Stack Research

**Domain:** Insurance agent operating system (multi-tenant SaaS)
**Researched:** 2026-02-05
**Confidence:** HIGH (core stack pre-selected by user; supporting libraries are established choices)

## Recommended Stack

### Core Technologies (Pre-selected)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x | Frontend framework (App Router) | Server components, API routes, SSR/SSG, file-based routing. Industry standard for React apps. |
| Tailwind CSS | 4.x | Utility-first CSS | Rapid UI development, consistent design, excellent with component libraries |
| NestJS | 11.x | Backend API framework | Modular architecture, decorators, dependency injection, great for structured APIs |
| Supabase | Latest | Auth + PostgreSQL + Storage | All-in-one platform: auth with phone verification, managed PostgreSQL, file storage, row-level security |
| Prisma | 6.x | ORM | Type-safe database queries, excellent migrations, schema-first design |
| Resend | Latest | Transactional email | Simple API, React Email templates, good deliverability |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **shadcn/ui** | Latest | UI component library | All UI components — built on Radix, Tailwind, fully customizable |
| **React Hook Form** | 7.x | Form management | All forms — client profiles, policy creation, expense entry |
| **Zod** | 3.x | Schema validation | Form validation + API request/response validation |
| **TanStack Query** | 5.x | Server state management | API data fetching, caching, optimistic updates |
| **date-fns** | 4.x | Date manipulation | Renewal date calculations, scheduling, display formatting |
| **Recharts** | 2.x | Charts/analytics | Dashboard charts, analytics module visualizations |
| **Zustand** | 5.x | Client state management | UI state, dashboard filters, sidebar state |
| **React Email** | Latest | Email templates | Paired with Resend — type-safe email templates |
| **uploadthing** or **Supabase Storage SDK** | Latest | File upload handling | Document uploads, receipt image uploads |
| **nuqs** | 2.x | URL query state | Search filters, pagination, analytics filters synced to URL |
| **@tanstack/react-table** | 8.x | Data tables | Client lists, policy lists, expense tables |
| **next-safe-action** | 7.x | Server actions | Type-safe server actions with validation |
| **class-validator + class-transformer** | Latest | NestJS validation | DTO validation in NestJS controllers |
| **@nestjs/swagger** | Latest | API documentation | Auto-generated API docs from decorators |
| **@nestjs/schedule** | Latest | Cron/scheduling | Renewal reminder emails, budget alert checks |
| **@nestjs/passport + @nestjs/jwt** | Latest | Auth guards | Supabase JWT verification in NestJS |
| **nanoid** | 5.x | ID generation | Public-facing IDs (agent badge slugs, shareable links) |
| **sharp** | Latest | Image processing | Resize agent photos, receipt thumbnails |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript | Type safety across full stack | Strict mode enabled |
| ESLint + Prettier | Code quality + formatting | Consistent codebase |
| Vitest | Unit/integration testing | Fast, Vite-based, good DX |
| Playwright | E2E testing | Browser automation for critical flows |
| Husky + lint-staged | Pre-commit hooks | Lint and format on commit |
| Docker Compose | Local development | Supabase local, consistent dev environment |
| Turborepo | Monorepo management | If frontend + backend in same repo |

## Installation

```bash
# Frontend (Next.js app)
npx create-next-app@latest anchor-web --typescript --tailwind --app --src-dir
cd anchor-web
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query @tanstack/react-table
npm install zustand nuqs date-fns recharts nanoid
npm install next-safe-action
npm install -D vitest @testing-library/react playwright

# Backend (NestJS app)
npx @nestjs/cli new anchor-api
cd anchor-api
npm install @nestjs/swagger @nestjs/schedule @nestjs/passport @nestjs/jwt
npm install prisma @prisma/client
npm install class-validator class-transformer
npm install @supabase/supabase-js
npm install resend @react-email/components
npm install sharp
npm install -D vitest
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| shadcn/ui | Mantine, Chakra UI | If you want pre-styled components out of box (less customization) |
| React Hook Form | Formik | Formik is heavier; RHF has better performance and smaller bundle |
| TanStack Query | SWR | SWR is simpler but TanStack has more features (mutations, optimistic updates) |
| Zustand | Redux Toolkit, Jotai | Redux for very complex state; Jotai for atomic state patterns |
| date-fns | Day.js, Luxon | Day.js is smaller; Luxon for timezone-heavy apps |
| Recharts | Chart.js, Nivo | Chart.js for more chart types; Nivo for d3-based visualizations |
| Prisma | Drizzle ORM, TypeORM | Drizzle is lighter/faster; TypeORM integrates more naturally with NestJS decorators |
| Vitest | Jest | Jest is more established; Vitest is faster with better ESM support |
| Turborepo | Nx | Nx for larger teams with more complex dependency graphs |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Moment.js | Deprecated, huge bundle size | date-fns or Day.js |
| Redux (plain) | Too much boilerplate for this app size | Zustand for client state, TanStack Query for server state |
| Styled-components/Emotion | Runtime CSS-in-JS has performance overhead | Tailwind CSS |
| Express.js (standalone) | Less structure for growing codebase | NestJS (already decided) |
| Mongoose/MongoDB | Relational data (clients→policies→tasks) needs PostgreSQL | Prisma + PostgreSQL |
| Firebase | Less SQL power, vendor lock-in concerns | Supabase (already decided) |
| Nodemailer | Low-level, requires SMTP config | Resend (simpler API, better DX) |

## Monorepo vs Separate Repos

**Recommended: Monorepo with Turborepo**

```
anchor/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared/       # Shared types, constants, validation schemas
│   ├── database/     # Prisma schema + client
│   └── email/        # React Email templates
├── turbo.json
└── package.json
```

**Why:** Shared types between frontend and backend prevent drift. Prisma schema in one place. Email templates reusable. Single CI pipeline.

## Version Compatibility Notes

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15 | React 19 | Server components, use client directive for interactive components |
| Prisma 6 | Supabase PostgreSQL | Direct connection string works; use connection pooling for serverless |
| Supabase Auth | NestJS JWT guards | Verify Supabase JWT tokens in NestJS middleware |
| shadcn/ui | Tailwind 4 | Ensure you initialize with Tailwind v4 config |

---
*Stack research for: Insurance Agent Operating System*
*Researched: 2026-02-05*
