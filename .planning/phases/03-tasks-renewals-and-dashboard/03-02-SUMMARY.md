---
phase: 03-tasks-renewals-and-dashboard
plan: 02
subsystem: api
tags: [nestjs, prisma, tasks, renewals, cron, schedule, crud, tenant-scoping]

# Dependency graph
requires:
  - phase: 03-tasks-renewals-and-dashboard
    plan: 01
    provides: Task Prisma model, shared types/schemas/constants, @nestjs/schedule dependency
  - phase: 02-client-and-policy-management
    provides: PoliciesService, PoliciesModule, TimelineService, ClientsController patterns
provides:
  - Task CRUD API (POST/GET/PATCH/DELETE /tasks, GET /tasks/assignees)
  - Task search/filter/pagination with status, priority, assignee, client, policy, type filters
  - RenewalsService with idempotent task generation at 60/30/7 day milestones
  - RenewalsScheduler daily cron at 1 AM Toronto time
  - Policy lifecycle hooks (create->generate, update->regenerate, cancel->delete)
  - Renewal task "dismissible only" enforcement (no content edits)
  - ScheduleModule.forRoot() in AppModule
affects:
  - 03-04 (dashboard will display tasks)
  - 03-05 (notifications will reference tasks for daily digest)

# Tech tracking
tech-stack:
  added: []
  patterns: ["Cron jobs use raw this.prisma not tenantClient (no CLS context)", "Renewal idempotency via findFirst before create", "Policy queried fresh with client includes for task description"]

key-files:
  created:
    - apps/api/src/tasks/tasks.module.ts
    - apps/api/src/tasks/tasks.controller.ts
    - apps/api/src/tasks/tasks.service.ts
    - apps/api/src/tasks/dto/create-task.dto.ts
    - apps/api/src/tasks/dto/update-task.dto.ts
    - apps/api/src/tasks/dto/search-tasks.dto.ts
    - apps/api/src/renewals/renewals.module.ts
    - apps/api/src/renewals/renewals.service.ts
    - apps/api/src/renewals/renewals.scheduler.ts
  modified:
    - apps/api/src/policies/policies.service.ts
    - apps/api/src/policies/policies.module.ts
    - apps/api/src/app.module.ts

key-decisions:
  - "Cron/scheduler services use raw this.prisma (not tenantClient) since cron jobs have no HTTP/CLS context"
  - "Renewal lifecycle hooks wrapped in try/catch to not fail the main policy operation"
  - "GET /tasks/assignees has no @Roles('admin') guard -- any authenticated user can access"
  - "Renewal tasks enforce 'dismissible only' rule: only status changes allowed, content edits rejected with BadRequestException"

patterns-established:
  - "Renewal idempotency: check findFirst before creating to prevent duplicate tasks"
  - "Policy fresh query with client includes before generating renewal tasks (for client name in description)"
  - "Scheduler pattern: @Cron with try/catch so failures don't crash the process"

# Metrics
duration: 6min
completed: 2026-02-22
---

# Phase 3 Plan 02: Task CRUD Backend & Renewal Engine Summary

**Full Task CRUD API with tenant-scoped search/filter/pagination, plus renewal task auto-generation engine with daily cron, idempotency, and policy lifecycle hooks**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-22T03:43:42Z
- **Completed:** 2026-02-22T03:49:57Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Task CRUD API: POST/GET/PATCH/DELETE /tasks with tenant scoping, GET /tasks/assignees for any authenticated user
- Task search supports filters: status, priority, assignee, client, policy, type, plus text search on title/description
- Renewal engine generates tasks at 60/30/7 day milestones with escalating priority (medium/high/urgent)
- Idempotent renewal generation: running twice never creates duplicates
- Policy create -> auto-generate renewal tasks; policy endDate change -> delete+regenerate; policy cancel/expire -> delete pending
- Renewal tasks enforce "dismissible only" rule (no content edits, only status changes)
- Activity events logged for task_created, task_completed, task_status_changed
- Daily cron scheduled at 1 AM Toronto time with error-safe try/catch
- ScheduleModule.forRoot() registered in AppModule

## Task Commits

Each task was committed atomically:

1. **Task 1: Task CRUD backend -- module, service, controller, DTOs** - `989af9e` (feat)
2. **Task 2: Renewal engine -- service, scheduler, policy lifecycle hooks** - `e852472` (feat)

## Files Created/Modified
- `apps/api/src/tasks/dto/create-task.dto.ts` - CreateTaskDto with class-validator decorators
- `apps/api/src/tasks/dto/update-task.dto.ts` - UpdateTaskDto with all optional fields
- `apps/api/src/tasks/dto/search-tasks.dto.ts` - SearchTasksDto with query params, pagination, type filter
- `apps/api/src/tasks/tasks.service.ts` - Task CRUD business logic with tenant scoping, renewal enforcement, activity events
- `apps/api/src/tasks/tasks.controller.ts` - Task endpoints with GET /assignees before GET /:id
- `apps/api/src/tasks/tasks.module.ts` - TasksModule importing AuthModule and TimelineModule
- `apps/api/src/renewals/renewals.service.ts` - Renewal task generation with idempotency, delete, regenerate
- `apps/api/src/renewals/renewals.scheduler.ts` - Daily cron at 1 AM Toronto time
- `apps/api/src/renewals/renewals.module.ts` - RenewalsModule exporting RenewalsService
- `apps/api/src/policies/policies.service.ts` - Added RenewalsService injection and lifecycle hooks
- `apps/api/src/policies/policies.module.ts` - Added RenewalsModule import
- `apps/api/src/app.module.ts` - Added TasksModule, RenewalsModule, ScheduleModule.forRoot()

## Decisions Made
- Cron/scheduler services use raw `this.prisma` (not tenantClient) since cron jobs have no HTTP/CLS context -- prevents "Tenant context not set" error
- Renewal lifecycle hooks wrapped in try/catch to prevent renewal failures from breaking the main policy create/update operation
- GET /tasks/assignees has no @Roles('admin') guard -- any authenticated user in the tenant can fetch the assignee list
- Renewal tasks enforce "dismissible only" rule: BadRequestException thrown if user tries to edit title/description/dueDate/priority on type='renewal' tasks
- Policy always queried fresh with client includes before generating renewal tasks to ensure task descriptions contain client names (not "undefined undefined")

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Task CRUD API ready for Plan 04 (dashboard task list/kanban UI)
- Renewal engine operational for automated task generation
- TasksService exported for potential use by other modules
- RenewalsService exported and already injected into PoliciesService
- ScheduleModule.forRoot() ready for Plan 03 notifications scheduler

## Self-Check: PASSED

---
*Phase: 03-tasks-renewals-and-dashboard*
*Plan: 02*
*Completed: 2026-02-22*
