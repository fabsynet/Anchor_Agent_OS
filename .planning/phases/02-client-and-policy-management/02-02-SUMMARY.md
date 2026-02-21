---
phase: 02-client-and-policy-management
plan: 02
subsystem: api
tags: [nestjs, prisma, crud, tenant-isolation, status-machine, activity-events]

# Dependency graph
requires:
  - phase: 02-client-and-policy-management/02-01
    provides: Prisma schema (Client, Policy, ActivityEvent, Note models), shared types, Zod schemas
  - phase: 01-foundation-auth
    provides: JwtAuthGuard, RolesGuard, PrismaService with tenantClient extension, decorators
provides:
  - ClientsModule with CRUD, search, filter, and lead/client status conversion
  - TimelineModule with merged event+note timeline and note creation
  - PoliciesModule with CRUD, status transition validation, and auto-convert on first policy
  - Activity event logging for all mutations across all 3 modules
affects:
  - 02-03 (Client List & Detail Pages) - consumes client API endpoints
  - 02-04 (Policy Management UI) - consumes policy API endpoints
  - 02-05 (Timeline & Notes) - consumes timeline/notes API endpoints

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tenant-scoped CRUD via prisma.tenantClient (uses CLS-based extension)"
    - "Manual tenantId in count() and $transaction (extension doesn't override those)"
    - "Policy status machine with VALID_TRANSITIONS map"
    - "$transaction for atomic multi-model writes (policy create + lead auto-convert)"
    - "Timeline merges activityEvents + notes with kind discriminator field"

key-files:
  created:
    - apps/api/src/clients/clients.module.ts
    - apps/api/src/clients/clients.controller.ts
    - apps/api/src/clients/clients.service.ts
    - apps/api/src/clients/dto/create-client.dto.ts
    - apps/api/src/clients/dto/update-client.dto.ts
    - apps/api/src/clients/dto/search-clients.dto.ts
    - apps/api/src/timeline/timeline.module.ts
    - apps/api/src/timeline/timeline.controller.ts
    - apps/api/src/timeline/timeline.service.ts
    - apps/api/src/timeline/dto/create-note.dto.ts
    - apps/api/src/policies/policies.module.ts
    - apps/api/src/policies/policies.controller.ts
    - apps/api/src/policies/policies.service.ts
    - apps/api/src/policies/dto/create-policy.dto.ts
    - apps/api/src/policies/dto/update-policy.dto.ts
  modified:
    - apps/api/src/app.module.ts

key-decisions:
  - "Use 'as any' for Prisma create/update data due to tenant extension type mismatch"
  - "Manual tenantId in count() calls since tenant extension doesn't override count"
  - "Merged timeline fetches all events+notes then paginates in-memory (acceptable for MVP scale)"
  - "Policy $transaction uses raw tx (not tenantClient) with manual tenantId in data"

patterns-established:
  - "CRUD module pattern: Module imports AuthModule, Controller uses @UseGuards at class level, Service uses tenantClient"
  - "Activity event logging via TimelineService.createActivityEvent() after mutations"
  - "Status machine validation via VALID_TRANSITIONS record map"
  - "Nested resource routes: /clients/:clientId/policies, /clients/:clientId/timeline, /clients/:clientId/notes"

# Metrics
duration: 15min
completed: 2026-02-21
---

# Phase 2 Plan 2: Backend API Modules Summary

**Three NestJS modules (Clients, Timeline, Policies) with 13 endpoints, tenant-scoped CRUD, policy status machine, and activity event logging**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-21T20:27:34Z
- **Completed:** 2026-02-21T20:42:00Z
- **Tasks:** 2
- **Files modified:** 16 (15 created, 1 modified)

## Accomplishments
- ClientsModule: Full CRUD with text search (name/email/phone), status filter, pagination, computed policyCount/nextRenewalDate, and lead-to-client conversion with field validation
- TimelineModule: Merged chronological timeline of activity events and notes with pagination, immutable note creation with automatic event logging
- PoliciesModule: Full CRUD with status transition validation (draft->active->pending_renewal->renewed/expired/cancelled), atomic policy creation with lead auto-convert via $transaction
- Activity events logged for all mutations: client_created, client_updated, client_status_changed, note_added, policy_created, policy_updated, policy_status_changed, policy_deleted

## Task Commits

Each task was committed atomically:

1. **Task 1: ClientsModule -- CRUD, search, filter, status conversion** - `fec3385` (feat)
2. **Task 2: TimelineModule, PoliciesModule, wire activity events, register all in AppModule** - `4c7d4ea` (feat)

## Files Created/Modified
- `apps/api/src/clients/clients.module.ts` - NestJS module importing AuthModule + TimelineModule
- `apps/api/src/clients/clients.controller.ts` - 6 endpoints: POST, GET list, GET single, PATCH, DELETE, PATCH convert
- `apps/api/src/clients/clients.service.ts` - Client business logic with search, pagination, conversion validation, activity events
- `apps/api/src/clients/dto/create-client.dto.ts` - DTO with custom LeadContactRequired validator
- `apps/api/src/clients/dto/update-client.dto.ts` - Partial update DTO (all fields optional)
- `apps/api/src/clients/dto/search-clients.dto.ts` - Query params with @Type(() => Number) for pagination
- `apps/api/src/timeline/timeline.module.ts` - NestJS module exporting TimelineService
- `apps/api/src/timeline/timeline.controller.ts` - 2 endpoints: GET timeline, POST note
- `apps/api/src/timeline/timeline.service.ts` - Activity event creation, merged timeline, note creation
- `apps/api/src/timeline/dto/create-note.dto.ts` - Note content with 1-5000 char validation
- `apps/api/src/policies/policies.module.ts` - NestJS module importing TimelineModule
- `apps/api/src/policies/policies.controller.ts` - 5 endpoints: GET list, POST, GET single, PATCH, DELETE
- `apps/api/src/policies/policies.service.ts` - Policy CRUD with VALID_TRANSITIONS, $transaction, auto-convert
- `apps/api/src/policies/dto/create-policy.dto.ts` - Policy creation with type/status enum validation
- `apps/api/src/policies/dto/update-policy.dto.ts` - Partial update DTO
- `apps/api/src/app.module.ts` - Registered ClientsModule, TimelineModule, PoliciesModule

## Decisions Made
- **`as any` for Prisma create/update data:** The tenant extension returns a modified client whose type signatures don't match standard Prisma input types. Using `as any` on the data argument is necessary and safe since the extension injects tenantId at runtime.
- **Manual tenantId in count() calls:** The tenant extension only overrides findMany, findFirst, create, update, delete. Since count() is not overridden, tenantId must be manually included in the where clause to maintain tenant isolation.
- **In-memory pagination for timeline:** Events and notes are fetched separately, merged with a `kind` discriminator, sorted, then paginated in-memory. This is appropriate for MVP scale (hundreds of events per client, not millions).
- **$transaction uses raw Prisma tx:** Inside `$transaction()`, the callback receives raw Prisma client (not the extended tenantClient), so tenantId must be manually included in all data/where clauses within the transaction.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added tenantId to count() queries for tenant isolation**
- **Found during:** Task 1 (ClientsService.findAll)
- **Issue:** Tenant extension does not override count() method. Using `this.prisma.tenantClient.client.count()` would return cross-tenant counts, breaking tenant isolation.
- **Fix:** Used `this.prisma.client.count({ where: { ...where, tenantId } })` to manually inject tenantId. Same pattern applied in TimelineService for eventCount/noteCount.
- **Files modified:** apps/api/src/clients/clients.service.ts, apps/api/src/timeline/timeline.service.ts
- **Verification:** Build passes, count queries include tenantId
- **Committed in:** fec3385 (Task 1), 4c7d4ea (Task 2)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential fix for tenant isolation. Without this, paginated list totals would be incorrect across tenants.

## Issues Encountered
- Prisma `create()` via tenant extension rejects `Record<string, unknown>` typed data objects. Resolved by using inline data objects with `as any` type assertion, which is safe because the extension injects tenantId at runtime regardless of the TypeScript type.

## User Setup Required
None - no external service configuration required. These are backend modules that use existing Prisma/Supabase configuration from Phase 1.

## Next Phase Readiness
- All 13 API endpoints ready for frontend consumption in plans 02-03, 02-04, 02-05
- Endpoint summary:
  - `POST/GET/GET/:id/PATCH/:id/DELETE/:id/PATCH/:id/convert` on `/api/clients`
  - `GET /api/clients/:clientId/timeline`
  - `POST /api/clients/:clientId/notes`
  - `GET/POST/GET/:id/PATCH/:id/DELETE/:id` on `/api/clients/:clientId/policies`
- No blockers for frontend development

## Self-Check: PASSED

---
*Phase: 02-client-and-policy-management*
*Completed: 2026-02-21*
