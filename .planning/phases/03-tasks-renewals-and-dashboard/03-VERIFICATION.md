---
phase: 03-tasks-renewals-and-dashboard
verified: 2026-02-22T04:30:57Z
status: passed
score: 12/12 must-haves verified
gaps: []
human_verification:
  - test: "Create a policy with an endDate 30 days from now, then navigate to the dashboard"
    expected: "Renewal tasks appear in task list; dashboard summary shows renewalsIn30Days incremented"
    why_human: "Requires live Supabase and running API to confirm end-to-end renewal task generation on policy create"
  - test: "Toggle between table and kanban view on /tasks, drag a card between columns"
    expected: "View persists in localStorage; card moves to target column; PATCH /tasks/:id called with new status"
    why_human: "Drag-and-drop interaction and localStorage persistence cannot be verified statically"
  - test: "Configure RESEND_API_KEY and trigger sendDailyDigestForAllTenants"
    expected: "Email arrives with overdue tasks and renewal milestones across 60/30/7 day intervals"
    why_human: "Requires external Resend account and live data; cron timing is runtime behavior"
---

# Phase 3: Tasks, Renewals, and Dashboard Verification Report

**Phase Goal:** The system actively prevents quiet failures -- auto-generating renewal tasks and surfacing what needs attention daily
**Verified:** 2026-02-22T04:30:57Z
**Status:** PASSED
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | When a policy is created with expiration date, renewal tasks appear at 60/30/7 days before | VERIFIED | policies.service.ts L129-148: after create, queries policy with client, calls renewalsService.generateTasksForPolicy(). renewals.service.ts L86-133: iterates RENEWAL_MILESTONES, checks idempotency, creates tasks with correct priority escalation. |
| 2 | User can create, complete, and manage tasks linked to clients and policies | VERIFIED | Full CRUD in tasks.controller.ts and tasks.service.ts. Task form (task-form.tsx) has all fields, uses api.post/patch. Status changes log activity events. |
| 3 | Today Dashboard shows upcoming renewals (30/60 days) and overdue tasks | VERIFIED | dashboard.service.ts getUpcomingRenewals() queries 60-day window with daysRemaining. getOverdueTasks() queries dueDate < today AND status != done. Dashboard page renders RenewalsWidget and OverdueWidget. |
| 4 | Dashboard provides quick action shortcuts to add clients, tasks, and expenses | VERIFIED | quick-actions.tsx: 4 buttons navigating to /clients?action=create, /tasks?action=create, /policies?action=create, /expenses. Expense placeholder page exists at apps/web/src/app/(dashboard)/expenses/page.tsx. |
| 5 | System sends renewal reminder emails and daily overdue task digests | VERIFIED | notifications.service.ts uses Resend SDK, renders DailyDigestEmail via @react-email/render. 8 AM cron in notifications.scheduler.ts. 61-day window captures all three renewal intervals. digestOptOut respected. Empty digests skipped. |
| 6 | Renewal task auto-generation is idempotent (no duplicates) | VERIFIED | renewals.service.ts L97-108: findFirst check before creating -- skips if non-done renewal task for that policyId + renewalDaysBefore already exists. |
| 7 | Policy cancellation and endDate change trigger renewal task lifecycle management | VERIFIED | policies.service.ts L329-368: cancel/expire triggers deleteRenewalTasksForPolicy; endDate change triggers regenerateRenewalTasks (delete + regenerate with fresh client includes). |
| 8 | Renewal tasks are visually distinguishable and content-edit protected | VERIFIED | task-card.tsx L71-75: blue "Renewal" badge. task-form.tsx: title/description/dueDate/priority disabled when isRenewal. tasks.service.ts L182-191: BadRequestException on content edit attempts for renewal tasks. |
| 9 | Dashboard has 4 summary cards with correct counts and red urgency styling | VERIFIED | summary-cards.tsx: 4 cards (overdueCount, dueTodayCount, renewalsIn30Days, activeClients). Red border/text when overdueCount > 0. Skeleton loading states present. |
| 10 | Task list has table and kanban views with filters and pagination | VERIFIED | task-list.tsx (350 lines): search, status/priority/type filters, pagination, view toggle with localStorage persistence. task-table.tsx and task-kanban.tsx conditionally rendered based on viewMode. |
| 11 | Premium income shows current month, YTD, and trend | VERIFIED | dashboard.service.ts getPremiumIncome(): two aggregate queries per period using startDate with createdAt fallback. Trend with zero-division protection. premium-income.tsx renders CAD currency with TrendingUp/Down icons. |
| 12 | Daily digest covers all renewal intervals (60/30/7 days), not just 7-day | VERIFIED | notifications.service.ts L141: in61Days = addDays(today, 61). Query L162-179: type: 'renewal', status: 'todo', dueDate: { gte: today, lte: in61Days }. Comment explicitly documents 61-day window requirement. |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| packages/database/prisma/schema.prisma | VERIFIED | Task model with all fields, TaskStatus/Priority/Type enums, 4 indexes, onDelete: Cascade, digestOptOut on User, task activity event types |
| packages/shared/src/types/task.ts | VERIFIED | 32 lines, exports Task, TaskWithRelations, TaskStatus, TaskPriority, TaskType |
| packages/shared/src/validation/task.schema.ts | VERIFIED | 26 lines, createTaskSchema + updateTaskSchema with z.input types |
| packages/shared/src/constants/tasks.ts | VERIFIED | 19 lines, TASK_STATUSES, TASK_PRIORITIES, RENEWAL_MILESTONES (60/30/7 days) |
| packages/shared/src/index.ts | VERIFIED | Lines 74-88 re-export all task types, constants, schemas |
| apps/api/src/tasks/tasks.service.ts | VERIFIED | 271 lines, full CRUD, renewal enforcement, activity events, getAssignees |
| apps/api/src/tasks/tasks.controller.ts | VERIFIED | 103 lines, GET /assignees before GET /:id, JwtAuthGuard on all routes |
| apps/api/src/renewals/renewals.service.ts | VERIFIED | 171 lines, generateTasksForPolicy with idempotency, deleteRenewalTasksForPolicy, regenerateRenewalTasks, raw prisma (no CLS) |
| apps/api/src/renewals/renewals.scheduler.ts | VERIFIED | 29 lines, @Cron at 1 AM Toronto time |
| apps/api/src/policies/policies.service.ts | VERIFIED | RenewalsService injected, create hook L129-148, update hooks L329-368 |
| apps/api/src/dashboard/dashboard.service.ts | VERIFIED | 245 lines, all 5 methods, manual tenantId for count/aggregate |
| apps/api/src/dashboard/dashboard.controller.ts | VERIFIED | 56 lines, all 5 GET endpoints under /dashboard with JwtAuthGuard |
| apps/api/src/notifications/notifications.service.ts | VERIFIED | 242 lines, Resend SDK, digestOptOut check, 61-day renewal window, empty digest skip |
| apps/api/src/notifications/notifications.scheduler.ts | VERIFIED | 28 lines, @Cron at 8 AM Toronto time |
| apps/api/src/notifications/emails/daily-digest.tsx | VERIFIED | 254 lines, React Email components, overdue tasks + renewal milestones sections, Anchor navy styling |
| apps/api/src/app.module.ts | VERIFIED | TasksModule, RenewalsModule, DashboardModule, NotificationsModule, ScheduleModule.forRoot() all registered |
| apps/web/src/app/(dashboard)/page.tsx | VERIFIED | 101 lines, Promise.all with 5 api.get calls, all 6 widget sections rendered |
| apps/web/src/components/dashboard/summary-cards.tsx | VERIFIED | 108 lines, 4 cards, urgent prop triggers red styling when overdueCount > 0 |
| apps/web/src/components/dashboard/quick-actions.tsx | VERIFIED | 53 lines, 4 buttons with useRouter navigation |
| apps/web/src/components/dashboard/renewals-widget.tsx | VERIFIED | 130 lines, red/amber/green color coding (<=7/<=30/>30 days), client link, "View all" overflow |
| apps/web/src/components/dashboard/overdue-widget.tsx | VERIFIED | 152 lines, priority badge colors, overdue duration, renewal indicator, empty state |
| apps/web/src/components/dashboard/activity-feed.tsx | VERIFIED | 121 lines, event-type icon mapping, relative timestamps, client links |
| apps/web/src/components/dashboard/premium-income.tsx | VERIFIED | 117 lines, CAD currency formatter, TrendingUp/Down/Minus icons, three data points |
| apps/web/src/app/(dashboard)/expenses/page.tsx | VERIFIED | 39 lines, "Expense Tracking Coming Soon" placeholder (planned state for Phase 5) |
| apps/web/src/components/tasks/task-list.tsx | VERIFIED | 350 lines, all filters, pagination, view toggle, localStorage, form integration |
| apps/web/src/components/tasks/task-table.tsx | VERIFIED | 319 lines, @tanstack/react-table, all columns, renewal badge, overdue red |
| apps/web/src/components/tasks/task-kanban.tsx | VERIFIED | 122 lines, DndContext, 5px activation constraint, 4 columns, DragOverlay |
| apps/web/src/components/tasks/task-card.tsx | VERIFIED | 138 lines, useSortable, blue Renewal badge, priority dot, assignee initials |
| apps/web/src/components/tasks/task-form.tsx | VERIFIED | 403 lines, zodResolver, /tasks/assignees endpoint, renewal field disabling, cascading selects |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| policies.service.ts | renewals.service.ts | generateTasksForPolicy on create | WIRED | L129-148: queries policy with client includes, calls renewalsService.generateTasksForPolicy() |
| policies.service.ts | renewals.service.ts | deleteRenewalTasksForPolicy on cancel | WIRED | L332-337: checks cancelled/expired status, calls delete method |
| policies.service.ts | renewals.service.ts | regenerateRenewalTasks on endDate change | WIRED | L341-368: detects endDate change, queries fresh with client, calls regenerateRenewalTasks |
| renewals.scheduler.ts | renewals.service.ts | @Cron calls method | WIRED | @Cron('0 0 1 * * *') calls renewalsService.generateRenewalTasksForAllTenants() |
| notifications.scheduler.ts | notifications.service.ts | @Cron calls method | WIRED | @Cron('0 0 8 * * *') calls notificationsService.sendDailyDigestForAllTenants() |
| notifications.service.ts | resend.emails.send | Resend SDK | WIRED | L225-230: this.resend.emails.send() with HTML from render(DailyDigestEmail(data)) |
| dashboard.service.ts | prisma.task.count | Manual tenantId in count | WIRED | L30-46: explicit tenantId in count where clause (not relying on tenant extension) |
| task-list.tsx | /api/tasks endpoint | api.get with filters | WIRED | L105-107: api.get('/api/tasks?...') with URLSearchParams from filter state |
| task-kanban.tsx | /api/tasks/:id endpoint | onStatusChange -> api.patch | WIRED | Via task-list.tsx L123-132: api.patch on handleStatusChange |
| task-form.tsx | /api/tasks/assignees endpoint | api.get on open | WIRED | L152-157: api.get('/api/tasks/assignees') when dialog opens |
| apps/web page.tsx | All 5 dashboard endpoints | Promise.all with 5 api.get | WIRED | L43-55: Promise.all fetching all 5 dashboard endpoints |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| PLCY-06 | SATISFIED | Policy create/update/cancel triggers renewal task generation, regeneration, or deletion |
| TASK-01 | SATISFIED | POST /tasks creates tasks; form supports all fields including linked client and policy |
| TASK-02 | SATISFIED | GET /tasks returns paginated list with search, status, priority, type, assignee, client filters |
| TASK-03 | SATISFIED | PATCH /tasks/:id updates task; DELETE /tasks/:id removes task |
| TASK-04 | SATISFIED | Tasks linked to clients and policies via clientId/policyId FK with cascade deletes |
| TASK-05 | SATISFIED | Renewal tasks auto-generated at 60/30/7 days; idempotency check prevents duplicates; cron at 1 AM |
| TASK-06 | SATISFIED | Renewal tasks show blue "Renewal" badge; content fields disabled in edit; API enforces via BadRequestException |
| DASH-01 | SATISFIED | Dashboard shows upcoming renewals with daysRemaining color coding (60-day window) |
| DASH-02 | SATISFIED | Dashboard shows overdue tasks with count badge and priority badges |
| DASH-04 | SATISFIED | Quick actions: Add Client, Add Task, Add Policy, Add Expense with navigation |
| NOTF-01 | SATISFIED | Daily digest email includes renewal milestones at 60/30/7 intervals via 61-day query window |
| NOTF-02 | SATISFIED | Daily digest includes overdue tasks; digestOptOut=true users skipped; empty digests skipped |

### Anti-Patterns Found

No blocking or warning anti-patterns detected.

The "placeholder" text matches found during scanning are all HTML input placeholder attributes (form UX labels), not stub implementations. The expenses page is intentionally a "coming soon" notice per the plan specification -- Phase 5 is the intended delivery phase for expense management.

### Human Verification Required

**1. End-to-End Renewal Task Generation**
Test: Create a policy via UI with an endDate 30 days from now. Navigate to dashboard.
Expected: Renewal tasks appear; renewalsIn30Days counter increments on summary card.
Why human: Requires live Supabase connection and running API.

**2. Kanban Drag-and-Drop Status Change**
Test: Navigate to /tasks, toggle to kanban view, drag a task card from "To Do" to "In Progress".
Expected: Card moves to new column; PATCH /api/tasks/:id called with new status.
Why human: Drag-and-drop requires browser interaction with pointer events.

**3. View Mode Persistence**
Test: Switch to kanban view, close browser tab, reopen /tasks.
Expected: Kanban view restored from localStorage.
Why human: localStorage state persistence requires browser runtime.

**4. Daily Digest Email Delivery**
Test: Configure RESEND_API_KEY, create overdue tasks, invoke sendDailyDigestForAllTenants.
Expected: Email arrives with correct content; digestOptOut users receive no email.
Why human: Requires external Resend account and live data.

**5. Renewal Task Content Protection**
Test: Edit a renewal task via the task form.
Expected: Title/description/dueDate/priority fields disabled; PATCH with content fields returns 400.
Why human: Field disable state and API enforcement both need browser and server confirmation.

## Final Assessment

Phase 3 has achieved its stated goal. The system now actively prevents quiet failures through three complementary mechanisms:

1. **Auto-generation:** Renewal tasks created at 60/30/7 days before policy expiration with idempotent daily cron at 1 AM Toronto time. Policy lifecycle hooks (create, endDate change, cancellation) keep renewal tasks synchronized with policy state.

2. **Visibility:** The Today Dashboard surfaces overdue tasks, upcoming renewals, and a premium income summary with trend indicator. Summary cards provide at-a-glance urgency with red highlighting when overdueCount > 0. The task management interface provides both table and kanban views.

3. **Notification:** Daily 8 AM digest emails via Resend cover all renewal milestone intervals (61-day query window) and all overdue tasks. Users who opt out are respected; empty digests are not sent.

---

_Verified: 2026-02-22T04:30:57Z_
_Verifier: Claude (gsd-verifier)_
