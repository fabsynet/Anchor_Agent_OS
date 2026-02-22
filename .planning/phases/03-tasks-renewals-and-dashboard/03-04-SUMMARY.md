---
phase: 03-tasks-renewals-and-dashboard
plan: 04
subsystem: ui
tags: [react, tanstack-react-table, dnd-kit, kanban, tasks, react-hook-form, zod]

# Dependency graph
requires:
  - phase: 03-02
    provides: Task CRUD API endpoints, /tasks/assignees endpoint, TaskWithRelations type
  - phase: 02-03
    provides: Client list UI patterns (view-toggle, table, pagination, search)
provides:
  - /tasks page with table view (sortable, filterable, paginated)
  - Kanban board with drag-and-drop status changes via @dnd-kit
  - Task create/edit form dialog with client/policy linking
  - Renewal task visual distinction and read-only enforcement
affects: [03-05-dashboard, phase-4-expenses]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Kanban board with @dnd-kit/core DndContext + @dnd-kit/sortable for drag-and-drop"
    - "View mode toggle with localStorage persistence"
    - "Cascading select dropdowns (client -> policy)"

key-files:
  created:
    - apps/web/src/app/(dashboard)/tasks/page.tsx
    - apps/web/src/components/tasks/task-list.tsx
    - apps/web/src/components/tasks/task-table.tsx
    - apps/web/src/components/tasks/task-view-toggle.tsx
    - apps/web/src/components/tasks/task-kanban.tsx
    - apps/web/src/components/tasks/kanban-column.tsx
    - apps/web/src/components/tasks/task-card.tsx
    - apps/web/src/components/tasks/task-form.tsx
  modified: []

key-decisions:
  - "Used closestCorners collision detection for kanban (better for column-based layout than closestCenter)"
  - "5px drag activation constraint to prevent accidental drags on click"
  - "Assignee uses _none sentinel value in Select to allow unassignment (Radix Select doesn't allow empty string values)"
  - "Policy dropdown only shown when client is selected (cascading fetch)"

patterns-established:
  - "Kanban pattern: DndContext > KanbanColumn (useDroppable) > TaskCard (useSortable) with DragOverlay"
  - "Filter bar pattern: search + multiple Select dropdowns + view toggle in flex-wrap row"
  - "Form clean pattern: strip empty strings to undefined before API submission for optional UUID fields"

# Metrics
duration: 12min
completed: 2026-02-22
---

# Phase 3 Plan 04: Task Management UI Summary

**Task list page with table/kanban views, drag-and-drop status changes via @dnd-kit, and create/edit form with client/policy linking and renewal read-only enforcement**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-22T04:08:49Z
- **Completed:** 2026-02-22T04:21:08Z
- **Tasks:** 2
- **Files created:** 8

## Accomplishments
- /tasks page with table view featuring status badges, priority icons, renewal badges, overdue highlighting, and sortable columns
- Kanban board with 4 status columns (To Do, In Progress, Waiting, Done), drag-and-drop between columns via @dnd-kit
- Task form dialog supporting create/edit with all fields: title, description, status, priority, due date, assignee, client, policy
- Assignee dropdown fetches from /tasks/assignees endpoint (accessible to all authenticated users, not admin-only)
- Renewal tasks visually distinguished with blue badge and content fields disabled in edit mode
- View mode toggle with localStorage persistence matching client list pattern
- Filter bar with search, status, priority, and type (manual/renewal) dropdowns

## Task Commits

Each task was committed atomically:

1. **Task 1: Task list container, table view, and view toggle** - `e1498fa` (feat)
2. **Task 2: Kanban board with drag-and-drop, task card, and task form dialog** - `f48f90b` (feat)

## Files Created/Modified
- `apps/web/src/app/(dashboard)/tasks/page.tsx` - Tasks page wrapper
- `apps/web/src/components/tasks/task-list.tsx` - Main orchestrator with state, filters, pagination, and data fetching
- `apps/web/src/components/tasks/task-table.tsx` - Table view with @tanstack/react-table, status/priority/title/client/due date/assignee/actions columns
- `apps/web/src/components/tasks/task-view-toggle.tsx` - Table/kanban toggle following view-toggle.tsx pattern
- `apps/web/src/components/tasks/task-kanban.tsx` - Kanban board with DndContext, 4 columns, DragOverlay
- `apps/web/src/components/tasks/kanban-column.tsx` - Individual column with useDroppable and SortableContext
- `apps/web/src/components/tasks/task-card.tsx` - Draggable card with priority dot, renewal badge, due date, assignee initials
- `apps/web/src/components/tasks/task-form.tsx` - Dialog form with react-hook-form + zod, cascading client/policy selects

## Decisions Made
- Used `closestCorners` collision detection for kanban (better for column-based layouts than `closestCenter`)
- 5px drag activation constraint prevents accidental drags when clicking cards
- Used `_none` sentinel value in Select components to allow unassignment (Radix Select doesn't support empty string values)
- Policy dropdown conditionally rendered only when a client is selected (cascading fetch pattern)
- Renewal tasks in edit mode disable title, description, dueDate, priority fields -- only status is editable

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Task UI complete, ready for Dashboard UI (Plan 03-05) integration
- All task CRUD operations working through the API
- Kanban drag-and-drop status changes call PATCH /api/tasks/:id

## Self-Check: PASSED

---
*Phase: 03-tasks-renewals-and-dashboard*
*Completed: 2026-02-22*
