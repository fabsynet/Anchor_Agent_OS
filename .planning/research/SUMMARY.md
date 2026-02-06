# Project Research Summary

**Project:** Anchor
**Domain:** Insurance agent operating system (multi-tenant SaaS)
**Researched:** 2026-02-05
**Confidence:** HIGH

## Executive Summary

Anchor is entering a well-established market (insurance agency management systems) with a differentiated positioning: purpose-built for Canadian agents, focused on preventing quiet failures, and priced for small independent agencies. The major competitors (Applied Epic, HawkSoft, EZLynx, AgencyBloc) are either enterprise-priced or US-focused, creating a clear gap for a modern, Canada-first solution.

The chosen tech stack (Next.js + NestJS + Supabase + Prisma) is well-suited for this product. Supabase provides a solid all-in-one backend (auth with phone verification, PostgreSQL, storage), NestJS provides the structure needed for a growing multi-module API, and Next.js handles both the authenticated dashboard and public badge pages efficiently. The architecture should use row-level multi-tenancy with `tenant_id` on all tables — simple, maintainable, and sufficient for the expected scale.

The three biggest risks are: (1) cross-tenant data leakage, which must be prevented architecturally from day 1; (2) renewal engine silent failures, which would directly undermine Anchor's core value proposition; and (3) auth flow complexity with Supabase Auth + NestJS JWT verification + phone verification. All three can be mitigated with proper architecture in the foundation phase.

## Key Findings

### Recommended Stack

Core stack pre-selected and validated. Key supporting libraries:
- **shadcn/ui**: UI components (Radix + Tailwind, customizable)
- **React Hook Form + Zod**: Form management and validation
- **TanStack Query**: Server state management with caching
- **date-fns**: Date manipulation for renewal calculations
- **Recharts**: Dashboard charts and analytics
- **@nestjs/schedule**: Cron jobs for renewal engine and budget alerts
- **Monorepo (Turborepo)**: Shared types between frontend/backend

### Expected Features

**Must have (table stakes):**
- Client management with search, profiles, lead→client conversion
- Policy management with types, status, dates, carrier info
- Renewal tracking with automated reminders
- Task system tied to clients/policies
- Today Dashboard as daily driver
- Document upload and linking
- Email notifications

**Anchor's unique differentiators (no competitor offers all of these):**
- Integrated expense/budget tracking within agent OS
- Public Agent Badge page (anchor.com/badge/slug)
- Client trust layer (testimonials, surveys, feedback)
- Canada-first design (provinces, CAD, compliance)
- Compliance activity log for small agents

**Adoption gaps to address post-MVP:**
- CSV import (critical for switching from other tools)
- Household/account grouping (insurance is family-based)
- Calendar view for renewals/tasks

### Architecture Approach

Multi-tenant SaaS with row-level isolation (`tenant_id` on every table). NestJS organized as one module per domain (auth, clients, policies, tasks, documents, expenses, budgets, trust, analytics, compliance, notifications). Next.js App Router with route groups for auth vs. dashboard. Supabase handles auth, database, and file storage. Monorepo with shared types package.

### Critical Pitfalls

1. **Cross-tenant data leakage** — Add Prisma middleware + Supabase RLS from day 1. One missed filter = security breach.
2. **Renewal engine silent failures** — Must have logging, health checks, and dead man's switch. This IS the product.
3. **Supabase Auth + NestJS JWT mismatch** — Test the full auth flow end-to-end before building on top.
4. **File upload security** — Private buckets only, signed URLs, server-side file type validation.
5. **Dashboard performance** — Parallel queries, pagination, indexes on `tenant_id` columns from day 1.

## Implications for Roadmap

### Phase 1: Foundation & Auth
**Rationale:** Everything depends on auth, multi-tenancy, and core infrastructure.
**Delivers:** Monorepo setup, database schema, Supabase integration, auth flow (signup + email verify + phone verify + login), tenant isolation, user roles, base UI shell.
**Addresses:** AUTH features, multi-tenancy setup, onboarding flow start.
**Avoids:** Cross-tenant data leak pitfall, auth mismatch pitfall.

### Phase 2: Core Agent OS
**Rationale:** The client→policy→renewal→task chain is Anchor's core value. Must work before anything else.
**Delivers:** Client CRUD with search, policy management, renewal engine with auto-tasks, task system, basic dashboard skeleton.
**Addresses:** CLIENT, POLICY, TASK, RENEWAL features.
**Avoids:** Renewal silent failure pitfall, N+1 query pitfall.

### Phase 3: Documents, Compliance & Notifications
**Rationale:** Agents need document storage and email notifications to trust the system as their daily driver.
**Delivers:** Document upload/linking, compliance activity log, email notifications (renewal reminders, task reminders), full dashboard with all core widgets.
**Addresses:** DOCUMENT, COMPLIANCE, NOTIFICATION features.
**Avoids:** File security pitfall, email deliverability pitfall.

### Phase 4: Financial Awareness
**Rationale:** Expense/budget tracking is self-contained and a key differentiator. Can be built in parallel track.
**Delivers:** Expense tracking, receipt uploads, monthly budgets, 80% budget alerts, financial dashboard widget.
**Addresses:** EXPENSE, BUDGET features.
**Avoids:** Feature dependency — expenses need document storage (from Phase 3).

### Phase 5: Trust & Reputation Layer
**Rationale:** Trust features are self-contained and don't block other modules.
**Delivers:** Testimonial request links, client surveys/feedback, public Agent Badge page.
**Addresses:** TRUST features, public-facing pages.
**Avoids:** Badge security pitfall (no private data on public pages).

### Phase 6: Analytics & Polish
**Rationale:** Analytics depend on data from all other modules. Polish improves retention.
**Delivers:** Light analytics (clients by type, renewals by month, cross-sell signals, province filtering), UX polish, performance optimization, comprehensive testing.
**Addresses:** ANALYTICS features, production readiness.
**Avoids:** UX overload pitfall, performance pitfalls.

### Phase Ordering Rationale

- **Foundation first (Phase 1):** Auth + tenancy + roles is the skeleton everything hangs on. Building features before this is solid means rebuilding later.
- **Core value chain second (Phase 2):** Client→Policy→Renewal→Task is why Anchor exists. Agents must see this working to believe in the product.
- **Documents + notifications third (Phase 3):** Makes the system feel complete — agents can store docs and receive reminders. This is where Anchor becomes a daily driver.
- **Finance + Trust parallel (Phases 4-5):** Both are self-contained differentiators. Can be built in parallel by different team members or sequentially.
- **Analytics last (Phase 6):** Needs data from all modules to be meaningful. Also includes polish pass.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Supabase Auth + NestJS integration patterns — needs API research
- **Phase 3:** Document storage security patterns with Supabase Storage
- **Phase 5:** Public page SEO and ISR patterns for Agent Badge

Phases with standard patterns (can skip research):
- **Phase 2:** Standard CRUD + scheduling patterns
- **Phase 4:** Standard expense/budget tracking patterns
- **Phase 6:** Standard analytics patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack pre-selected and validated. Supporting libraries are established choices. |
| Features | MEDIUM-HIGH | Insurance agent management features well-established. Competitor analysis based on training data. |
| Architecture | HIGH | Multi-tenant SaaS patterns well-documented. NestJS + Prisma + Supabase is a proven combination. |
| Pitfalls | HIGH | Domain + technical pitfalls based on well-known patterns. Multi-tenancy risks are well-documented. |

**Overall confidence:** HIGH

### Gaps to Address

- Current competitor feature sets (2025-2026) — verify before finalizing differentiation claims
- Canadian provincial insurance compliance specifics — verify FSRA/AMF requirements
- Supabase phone auth pricing at scale — verify costs
- Exact library version compatibility (Next.js 15 + React 19 + shadcn/ui + Tailwind 4)

---
*Research completed: 2026-02-05*
*Ready for roadmap: yes*
