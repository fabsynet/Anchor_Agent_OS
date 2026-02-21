# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** No renewal, follow-up, or compliance task silently slips through the cracks.
**Current focus:** Phase 2 -- Client & Policy Management

## Current Position

Phase: 2 of 7 (Client & Policy Management)
Plan: 4 of 5 in current phase
Status: In progress -- Plan 02-04 (Client Profile & Timeline UI) complete, Wave 3 plans executing in parallel
Last activity: 2026-02-21 -- Completed 02-04-PLAN.md (Client profile page, timeline/notes UI)

Progress: ███████░░░░░░░░░░░░░░ 29% (6/21 plans complete, 2 Phase 1 plans still at checkpoint)

## Phase 1 Checkpoint State (Carried Forward)

Plans 01-04 and 01-05 remain at checkpoint:human-verify. Auth rewrite was committed 2026-02-17 but user has not yet verified. These do not block Phase 2 execution.

### 01-04: App Shell (checkpoint pending)
- **Remaining to verify:** Theme toggle, responsive hamburger, logout, overall nav

### 01-05: Invitations & Team (checkpoint pending)
- **Remaining to verify:** Team settings page loads, invite form, pending invites, revoke, invite cap, setup wizard, accept-invite page

## Phase 2 Progress

### 02-01: Data Foundation -- COMPLETE
- **Commits:** 8164de7 (Prisma schema), 6594697 (shared types + deps)
- **Delivered:** 4 new models (Client, Policy, ActivityEvent, Note), 5 enums, shared types, Zod schemas, Canadian insurance constants, @tanstack/react-table, date-fns, 6 shadcn components
- **Summary:** .planning/phases/02-client-and-policy-management/02-01-SUMMARY.md

### 02-02: Backend API Modules -- COMPLETE
- **Commits:** fec3385 (ClientsModule), 4c7d4ea (TimelineModule + PoliciesModule + wiring)
- **Delivered:** 13 API endpoints across 3 NestJS modules (Clients, Timeline, Policies), tenant-scoped CRUD, policy status machine, activity event logging, lead auto-convert on first policy
- **Summary:** .planning/phases/02-client-and-policy-management/02-02-SUMMARY.md

### 02-03: Client List & Forms -- IN PROGRESS (Wave 3, parallel with 02-04)
- Running concurrently with 02-04

### 02-04: Client Profile & Timeline UI -- COMPLETE
- **Commits:** 282ba71 (profile page + header + overview), 7293508 (timeline/notes tab + components)
- **Delivered:** Client profile page at /clients/[id] with 4 tabs (Overview, Policies placeholder, Timeline/Notes, Documents placeholder), profile header with Convert/Delete actions, timeline compact/expanded views, note creation, 8 activity icons
- **Summary:** .planning/phases/02-client-and-policy-management/02-04-SUMMARY.md

### 02-05: Policy Management UI -- NOT STARTED

## Environment Setup Required

### Root `.env` (Anchor_MVP/.env)
```
NEXT_PUBLIC_SUPABASE_URL=<from Dashboard > Settings > API>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Dashboard > Settings > API>
SUPABASE_SERVICE_ROLE_KEY=<from Dashboard > Settings > API>
SUPABASE_JWT_SECRET=<from Dashboard > Settings > API>
DATABASE_URL=<from Dashboard > Settings > Database > Connection string (pooling)>
DIRECT_DATABASE_URL=<from Dashboard > Settings > Database > Connection string (direct)>
API_PORT=3001
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
RESEND_API_KEY=<from Resend dashboard>
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Web `.env.local` (apps/web/.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=<same as root>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same as root>
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Database `.env` (packages/database/.env)
```
DATABASE_URL=<same as root -- needed for Prisma CLI>
DIRECT_DATABASE_URL=<same as root -- needed for migrations>
```

## Accumulated Context

### Decisions

| Decision | When | Rationale |
|----------|------|-----------|
| Replaced passport-jwt with Supabase auth.getUser() | Phase 1 | Eliminates JWT secret mismatch issues |
| All DB access through Prisma | Phase 1 | No more Supabase REST API for table queries |
| Frontend uses /api/auth/me | Phase 1 | useUser hook calls backend API, not Supabase tables directly |
| ClsModule is global | Phase 1 | No need to import in each module |
| Auto-provision tenant+user in guard | Phase 1 | Handles case where handle_new_user trigger didn't fire |
| Decimal fields as string in shared types | Phase 2 | Prisma serializes Decimals as strings; parseFloat only for display |
| prisma db push for migrations (Supabase) | Phase 2 | Shadow DB fails on auth.users trigger; use db push + manual migration |
| shadcn components created manually | Phase 2 | shadcn CLI fails in pnpm workspace; radix-ui already installed |
| updateSchema as separate z.object (not .partial()) | Phase 2 | .partial() on refined schema carries over .refine() incorrectly |
| Use 'as any' for Prisma create/update data in tenant extension | Phase 2 | Tenant extension type signatures don't match standard Prisma input types |
| Manual tenantId in count() and $transaction | Phase 2 | Tenant extension only overrides findMany/findFirst/create/update/delete |
| In-memory timeline pagination | Phase 2 | Merges events+notes then paginates; acceptable for MVP scale |
| React.use(params) for Next.js 16 dynamic routes | Phase 2 | Next.js 16 passes params as Promise; use() unwraps in client components |
| TimelineItem type defined locally, not in shared | Phase 2 | Merged event/note shape is specific to frontend timeline display |

### Pending Todos

- Verify DATABASE_URL is in root .env and packages/database/.env
- Test /settings/team after auth rewrite (Phase 1 checkpoint)
- Apply RLS migration via Supabase SQL Editor (may not be needed)
- RESEND_API_KEY needed for invitation email sending (01-05)
- Complete Phase 2: 02-03 (in progress), 02-05 (not started)

### Blockers/Concerns

- handle_new_user Supabase trigger may not be set up -- guard auto-provisions as fallback
- Phase 1 checkpoints (01-04, 01-05) still pending user verification -- does not block Phase 2

## Session Continuity

Last session: 2026-02-21
Stopped at: Completed 02-04-PLAN.md (Client Profile & Timeline UI). 8 new frontend files.
Resume with: Complete 02-03 (if not finished by parallel agent), then execute 02-05-PLAN.md (Policy Management UI).
