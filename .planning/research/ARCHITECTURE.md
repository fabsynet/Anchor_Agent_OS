# Architecture Research

**Domain:** Multi-tenant SaaS insurance agent operating system
**Researched:** 2026-02-05
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Next.js App │  │ Public Badge │  │ Email Templates   │  │
│  │  (App Router)│  │ Pages (SSG)  │  │ (React Email)     │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────┘  │
│         │                 │                                   │
├─────────┴─────────────────┴───────────────────────────────────┤
│                       API LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                    NestJS API                             ││
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐││
│  │  │ Auth   │ │ Client │ │ Policy │ │ Finance│ │ Trust  │││
│  │  │ Module │ │ Module │ │ Module │ │ Module │ │ Module │││
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘││
│  └──────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Supabase    │  │  Supabase    │  │  Supabase        │   │
│  │  PostgreSQL  │  │  Auth        │  │  Storage         │   │
│  │  (via Prisma)│  │              │  │  (Documents/     │   │
│  │              │  │              │  │   Receipts)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│                    EXTERNAL SERVICES                         │
│  ┌──────────┐  ┌──────────┐                                 │
│  │  Resend   │  │  Vercel  │                                │
│  │  (Email)  │  │  (Host)  │                                │
│  └──────────┘  └──────────┘                                 │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Next.js App | All authenticated UI: dashboard, clients, policies, tasks, expenses, settings | App Router with layouts, server components for data, client components for interactivity |
| Public Badge Pages | Public agent profile pages (no auth required) | Static generation (SSG) with ISR for updates |
| NestJS API | All business logic, data validation, authorization, scheduling | REST API with modules per domain |
| Auth Module | Login, signup, phone verification, session management, JWT validation | Supabase Auth SDK + NestJS guards |
| Client Module | CRUD clients, lead→client conversion, timeline, search | Service + Controller + Prisma |
| Policy Module | CRUD policies, renewal engine, auto-task generation | Service + scheduled jobs |
| Finance Module | Expenses, budgets, receipt uploads, alerts | Service + scheduled budget checks |
| Trust Module | Testimonials, surveys, feedback, badge page data | Service + public API for badge |
| Supabase PostgreSQL | All relational data with row-level tenant isolation | Accessed via Prisma ORM |
| Supabase Auth | User authentication, phone verification, JWT tokens | SDK integration on both frontend and backend |
| Supabase Storage | Documents, receipt images, agent photos | Organized in buckets per tenant |

## Multi-Tenancy Strategy

### Recommended: Row-Level Isolation with `tenant_id`

**Pattern:** Every table has a `tenant_id` column. Every query filters by `tenant_id`.

```
┌─────────────────────────────────────────────┐
│          Single PostgreSQL Database          │
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │  tenants table                          ││
│  │  id | name | plan | created_at          ││
│  └─────────────────────────────────────────┘│
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │  users table                            ││
│  │  id | tenant_id | email | role          ││
│  └─────────────────────────────────────────┘│
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │  clients table                          ││
│  │  id | tenant_id | name | status | ...   ││
│  └─────────────────────────────────────────┘│
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │  policies table                         ││
│  │  id | tenant_id | client_id | ...       ││
│  └─────────────────────────────────────────┘│
│                                              │
│  All tables follow: WHERE tenant_id = ?      │
└─────────────────────────────────────────────┘
```

**Why row-level over schema-per-tenant:**
- Simpler to implement and maintain
- Works well up to ~10,000 tenants
- Single migration path
- Prisma handles this naturally
- Supabase RLS can add a second layer of protection

**Implementation in NestJS:**
1. JWT token contains `tenant_id` (set during signup)
2. NestJS middleware extracts `tenant_id` from JWT
3. Custom decorator `@TenantId()` injects it into controllers
4. All service methods accept and filter by `tenant_id`
5. Prisma middleware can auto-inject `tenant_id` on queries as safety net

### Storage Multi-Tenancy

```
Supabase Storage Buckets:
  documents/
    {tenant_id}/
      {client_id}/
        {file_name}
  receipts/
    {tenant_id}/
      {expense_id}/
        {file_name}
  avatars/
    {tenant_id}/
      {user_id}.jpg
  badges/
    {tenant_id}/
      photo.jpg
```

## Recommended Project Structure

### Monorepo Layout

```
anchor/
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                # App Router pages
│   │   │   │   ├── (auth)/         # Auth pages (login, signup, verify)
│   │   │   │   ├── (dashboard)/    # Authenticated app shell
│   │   │   │   │   ├── page.tsx    # Today Dashboard
│   │   │   │   │   ├── clients/    # Client management
│   │   │   │   │   ├── policies/   # Policy management
│   │   │   │   │   ├── tasks/      # Task management
│   │   │   │   │   ├── documents/  # Document management
│   │   │   │   │   ├── expenses/   # Expense tracking
│   │   │   │   │   ├── budgets/    # Budget management
│   │   │   │   │   ├── analytics/  # Analytics/reports
│   │   │   │   │   ├── trust/      # Testimonials, surveys
│   │   │   │   │   └── settings/   # Account settings
│   │   │   │   └── badge/[slug]/   # Public Agent Badge (no auth)
│   │   │   ├── components/         # Shared UI components
│   │   │   │   ├── ui/             # shadcn/ui components
│   │   │   │   ├── dashboard/      # Dashboard widgets
│   │   │   │   ├── forms/          # Form components
│   │   │   │   └── layout/         # Shell, sidebar, nav
│   │   │   ├── lib/                # Utilities
│   │   │   │   ├── api.ts          # API client
│   │   │   │   ├── supabase/       # Supabase client setup
│   │   │   │   └── utils.ts        # Helpers
│   │   │   └── hooks/              # Custom React hooks
│   │   └── public/                 # Static assets
│   │
│   └── api/                        # NestJS backend
│       └── src/
│           ├── auth/               # Auth module
│           │   ├── auth.module.ts
│           │   ├── auth.controller.ts
│           │   ├── auth.service.ts
│           │   ├── guards/         # JWT guard, role guard
│           │   └── decorators/     # @TenantId(), @CurrentUser()
│           ├── clients/            # Client module
│           │   ├── clients.module.ts
│           │   ├── clients.controller.ts
│           │   ├── clients.service.ts
│           │   └── dto/            # Create/Update DTOs
│           ├── policies/           # Policy module
│           │   ├── policies.module.ts
│           │   ├── policies.controller.ts
│           │   ├── policies.service.ts
│           │   └── renewal.service.ts  # Renewal engine
│           ├── tasks/              # Task module
│           ├── documents/          # Document module
│           ├── expenses/           # Expense module
│           ├── budgets/            # Budget module
│           ├── trust/              # Trust layer module
│           │   ├── testimonials/
│           │   ├── surveys/
│           │   └── badge/          # Public badge API
│           ├── analytics/          # Analytics module
│           ├── notifications/      # Email notifications module
│           ├── compliance/         # Compliance log module
│           ├── common/             # Shared utilities
│           │   ├── middleware/     # Tenant extraction
│           │   ├── interceptors/  # Logging, transform
│           │   ├── filters/       # Exception filters
│           │   └── pipes/         # Validation pipes
│           ├── prisma/            # Prisma service
│           └── main.ts
│
├── packages/
│   ├── shared/                    # Shared types & constants
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── constants/             # Enums, config values
│   │   └── validation/            # Shared Zod schemas
│   ├── database/                  # Prisma schema & migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── seed.ts
│   └── email/                     # React Email templates
│       ├── templates/
│       │   ├── renewal-reminder.tsx
│       │   ├── task-reminder.tsx
│       │   ├── budget-alert.tsx
│       │   ├── welcome.tsx
│       │   └── testimonial-request.tsx
│       └── index.ts
│
├── turbo.json
├── package.json
└── docker-compose.yml             # Local Supabase
```

### Structure Rationale

- **apps/web/**: Next.js App Router with route groups — `(auth)` for public pages, `(dashboard)` for authenticated pages with shared layout/sidebar
- **apps/api/**: NestJS with one module per domain — clean boundaries, testable services
- **packages/shared/**: TypeScript types shared between frontend and backend prevent API contract drift
- **packages/database/**: Prisma schema in one place, used by backend directly
- **packages/email/**: React Email templates consumed by backend notification service

## Architectural Patterns

### Pattern 1: Module-Per-Domain (NestJS)

**What:** Each business domain (clients, policies, tasks, etc.) is a self-contained NestJS module with its own controller, service, and DTOs.

**When to use:** Always — this is the core organizational pattern.

**Trade-offs:** Slightly more files to create per feature, but much better separation of concerns and testability.

```typescript
// policies/policies.module.ts
@Module({
  controllers: [PoliciesController],
  providers: [PoliciesService, RenewalService],
  exports: [PoliciesService], // Other modules can import
})
export class PoliciesModule {}
```

### Pattern 2: Tenant-Scoped Services

**What:** Every service method receives `tenantId` as first parameter. Never queries without tenant scope.

**When to use:** Every database operation.

**Trade-offs:** Slightly repetitive, but prevents cross-tenant data leaks.

```typescript
// clients/clients.service.ts
async findAll(tenantId: string, filters: ClientFilters) {
  return this.prisma.client.findMany({
    where: { tenantId, ...filters },
  });
}
```

### Pattern 3: Server Components + Client Components (Next.js)

**What:** Use server components for data fetching, client components for interactivity. Keep the boundary clear.

**When to use:** Every page.

```
Page (Server Component) — fetches data
  └── InteractiveWidget (Client Component) — handles clicks, forms
```

### Pattern 4: Optimistic Updates (TanStack Query)

**What:** Update the UI immediately on user action, rollback if the API fails.

**When to use:** Task completion, status changes, quick edits — anything where perceived speed matters.

## Data Flow

### Request Flow (Authenticated)

```
User Action (Browser)
    ↓
Next.js Client Component → API call via fetch/axios
    ↓
NestJS Controller → JWT Guard (verify Supabase token) → Extract tenant_id
    ↓
NestJS Service → Business logic → Prisma query (scoped to tenant_id)
    ↓
PostgreSQL → Returns data
    ↓
NestJS Service → Transform → Controller → JSON response
    ↓
TanStack Query cache update → React re-render → UI updated
```

### Renewal Auto-Task Flow

```
@Cron('0 8 * * *')  // Daily at 8 AM
    ↓
RenewalService.checkUpcomingRenewals()
    ↓
Query policies expiring in 60/30/7 days (per tenant)
    ↓
For each qualifying policy:
    ↓
Check if renewal task already exists → Skip if yes
    ↓
Create task linked to policy + client
    ↓
Send email notification via Resend
    ↓
Log compliance activity
```

### Public Badge Page Flow

```
Visitor hits anchor.com/badge/john-smith
    ↓
Next.js SSG/ISR → Fetch agent badge data (public API, no auth)
    ↓
Render: Photo, name, license, contact, testimonials
    ↓
Static page served from CDN (fast, SEO-friendly)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 agencies | Monolith is fine. Single Supabase instance, single NestJS deployment. Focus on correctness. |
| 500-5,000 agencies | Add connection pooling (PgBouncer/Supavisor). Add Redis for session caching. Index optimization on tenant_id columns. |
| 5,000+ agencies | Consider read replicas. Background job queue (BullMQ) for email/notification processing. CDN for badge pages. |

### Scaling Priorities

1. **First bottleneck:** Database connections — Supabase has connection limits. Use connection pooling early.
2. **Second bottleneck:** Cron job processing — as tenants grow, renewal checks take longer. Move to job queue.

## Anti-Patterns

### Anti-Pattern 1: Querying Without Tenant Scope

**What people do:** Forget to filter by `tenant_id` in a service method.
**Why it's wrong:** Cross-tenant data leak — agency A sees agency B's clients.
**Do this instead:** Prisma middleware that rejects queries without tenant filter. Code review checklist.

### Anti-Pattern 2: Fat Controllers

**What people do:** Put business logic in NestJS controllers.
**Why it's wrong:** Untestable, duplicated logic when multiple routes need same operation.
**Do this instead:** Controllers only handle HTTP concerns (parse request, call service, format response). Services handle business logic.

### Anti-Pattern 3: Client-Side Data Fetching for Initial Load

**What people do:** Use `useEffect` + `fetch` for page data in Next.js.
**Why it's wrong:** Waterfall requests, loading spinners, poor SEO.
**Do this instead:** Server components fetch data on the server. Pass to client components as props.

### Anti-Pattern 4: Single Massive Prisma Query

**What people do:** Try to fetch entire client profile with all relations in one query.
**Why it's wrong:** Slow queries, over-fetching, N+1 problems.
**Do this instead:** Fetch base record, then lazy-load relations as user navigates tabs.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | SDK on frontend + JWT verification on backend | Frontend: `@supabase/ssr` for cookie-based sessions. Backend: verify JWT in NestJS guard. |
| Supabase Storage | SDK for upload, signed URLs for access | Use signed URLs with expiry for document downloads. Public URLs for badge photos. |
| Resend | REST API from NestJS notification service | React Email templates compiled server-side. Rate limiting built-in. |
| Vercel | Git-based deployments for Next.js | Environment variables for Supabase keys, Resend API key. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Next.js ↔ NestJS | REST API (HTTP) | JSON payloads, shared TypeScript types |
| NestJS ↔ Supabase DB | Prisma Client (TCP) | Direct connection with pooling |
| NestJS ↔ Supabase Storage | Supabase SDK (HTTP) | For file management operations |
| NestJS modules ↔ each other | Direct service injection | NestJS DI handles cross-module dependencies |

---
*Architecture research for: Insurance Agent Operating System*
*Researched: 2026-02-05*
