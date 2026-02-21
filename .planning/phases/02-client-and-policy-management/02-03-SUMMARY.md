---
phase: 02-client-and-policy-management
plan: 03
subsystem: frontend
tags: [react, tanstack-table, react-hook-form, zod, shadcn, date-fns, crud]

# Dependency graph
requires:
  - phase: 02-client-and-policy-management/02-01
    provides: Shared types (ClientListItem, ClientStatus, Client), Zod schemas (createClientSchema), CANADIAN_PROVINCES constant, shadcn components (Tabs, AlertDialog), @tanstack/react-table, date-fns
  - phase: 02-client-and-policy-management/02-02
    provides: API endpoints (GET/POST/PATCH/DELETE /api/clients, paginated list with search/filter)
provides:
  - /clients page with Clients/Leads tabs, search, table/card toggle, pagination
  - /clients/new create form with lead/client conditional validation
  - /clients/[id]/edit form with prefilled data
  - Reusable ClientForm, ClientTable, ClientCards, ViewToggle components
affects:
  - 02-05 (Timeline & Notes) - client detail page will link from client list
  - Future phases - client list pattern reusable for other entity lists

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "z.input<typeof schema> for form type when schema uses .default() (Zod v4 input vs output type mismatch)"
    - "getSortedRowModel (not getSortingRowModel) in @tanstack/react-table 8.21"
    - "URLSearchParams for building query strings with api.get()"
    - "Debounced search via useState + useEffect + setTimeout (no lodash)"

key-files:
  created:
    - apps/web/src/app/(dashboard)/clients/page.tsx
    - apps/web/src/app/(dashboard)/clients/new/page.tsx
    - apps/web/src/app/(dashboard)/clients/[id]/edit/page.tsx
    - apps/web/src/components/clients/client-list.tsx
    - apps/web/src/components/clients/client-table.tsx
    - apps/web/src/components/clients/client-cards.tsx
    - apps/web/src/components/clients/client-form.tsx
    - apps/web/src/components/clients/view-toggle.tsx
  modified: []

key-decisions:
  - "Used createClientSchema for both create and edit forms (edit sends full data, backend handles partial update)"
  - "Used z.input<typeof createClientSchema> for form type to resolve Zod v4 .default() type mismatch with zodResolver"
  - "Simple Prev/Next pagination buttons instead of numbered pagination"
  - "AlertDialog delete confirmation in both table and card views (duplicated for independent state)"

patterns-established:
  - "Client list page pattern: Tabs + Search + ViewToggle + Table/Cards + Pagination"
  - "Client form pattern: react-hook-form + zodResolver + shadcn Form components"
  - "Delete flow: DropdownMenu action -> AlertDialog confirmation -> api.delete -> toast feedback"

# Metrics
duration: 30min
completed: 2026-02-21
---

# Phase 2 Plan 3: Client List & Forms Summary

**Client list page with Clients/Leads tabs, search, table/card toggle, and create/edit forms using react-hook-form + Zod validation with CANADIAN_PROVINCES**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-02-21T20:46:52Z
- **Completed:** 2026-02-21T21:17:23Z
- **Tasks:** 2/2
- **Files created:** 8

## Accomplishments
- /clients page with Clients and Leads tabs filtering by status, debounced search across name/email/phone, table/card view toggle, and Previous/Next pagination
- Table view using @tanstack/react-table with columns: Name (link to detail), Phone, Status (badge), Policies (count), Next Renewal (formatted date), Actions (edit/delete)
- Card grid view (1/2/3 columns responsive) with same data and actions
- Delete confirmation via AlertDialog with cascading delete warning and toast feedback
- /clients/new create form with Lead/Client status toggle controlling required field messaging
- /clients/[id]/edit form with loading state, client data prefill, and back navigation
- ClientForm uses react-hook-form + zodResolver(createClientSchema) + shadcn Form components
- Province selector uses CANADIAN_PROVINCES constant from @anchor/shared

## Task Commits

Each task was committed atomically:

1. **Task 1: Client list page with tabs, search, view toggle, and pagination** - `fa5b357` (feat)
2. **Task 2: Client create/edit forms with lead/client conditional validation** - `ba7ec0e` (feat)

## Files Created/Modified
- `apps/web/src/app/(dashboard)/clients/page.tsx` - Client list page wrapper rendering ClientList component
- `apps/web/src/app/(dashboard)/clients/new/page.tsx` - New client page with back link and ClientForm (create mode)
- `apps/web/src/app/(dashboard)/clients/[id]/edit/page.tsx` - Edit client page with loading state, data prefill, ClientForm (edit mode)
- `apps/web/src/components/clients/client-list.tsx` - Main list component: tabs, search (debounced), view toggle, pagination, data fetching, delete handler
- `apps/web/src/components/clients/client-table.tsx` - Table view with @tanstack/react-table, column definitions, sorting, AlertDialog delete confirmation
- `apps/web/src/components/clients/client-cards.tsx` - Card grid view with responsive layout, status badges, AlertDialog delete
- `apps/web/src/components/clients/client-form.tsx` - Shared create/edit form with status toggle, conditional validation, province selector, toast feedback
- `apps/web/src/components/clients/view-toggle.tsx` - Reusable table/cards toggle with List and LayoutGrid icons

## Decisions Made
- **Used createClientSchema for both create and edit modes:** The edit form always has all fields populated, so the `.refine()` validation passes. Avoids type union mismatch between `createClientSchema` and `updateClientSchema` resolvers. Backend handles partial update validation independently.
- **Used `z.input<typeof createClientSchema>` for form type:** Zod v4's `.default()` makes the input type optional but the output type required. Since `zodResolver` bridges the schema's input type, `useForm` must use `z.input` instead of `z.infer` (which returns the output type). This is a Zod v4 + RHF v7 compatibility pattern.
- **Simple Prev/Next pagination:** Used simple Previous/Next buttons with "Page X of Y" text instead of numbered pagination. Sufficient for MVP and avoids over-engineering.
- **Duplicated AlertDialog in table and card views:** Each view manages its own delete confirmation state independently. This keeps the components self-contained and avoids prop threading for dialog state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] @tanstack/react-table export name mismatch**
- **Found during:** Task 1 (build verification)
- **Issue:** Plan referenced `getSortingRowModel` but @tanstack/react-table 8.21 exports `getSortedRowModel`
- **Fix:** Changed import and usage to `getSortedRowModel`
- **Files modified:** apps/web/src/components/clients/client-table.tsx
- **Committed in:** fa5b357 (Task 1 commit)

**2. [Rule 1 - Bug] Zod v4 .default() type mismatch with zodResolver**
- **Found during:** Task 2 (build verification)
- **Issue:** `createClientSchema` uses `z.enum(['lead', 'client']).default('lead')` which makes `status` optional in the Zod input type but required in the output type. Using `useForm<CreateClientInput>` (output type) with `zodResolver` (input type) caused a TypeScript error.
- **Fix:** Defined `ClientFormValues = z.input<typeof createClientSchema>` and used it for `useForm` generic and `onSubmit` parameter type
- **Files modified:** apps/web/src/components/clients/client-form.tsx
- **Committed in:** ba7ec0e (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both were type-level issues caught at build time. No scope creep.

## Issues Encountered
- @tanstack/react-table 8.21 renamed `getSortingRowModel` to `getSortedRowModel` -- the plan and research referenced the old name
- Zod v4 `.default()` creates a split between input and output types that is incompatible with `zodResolver` when using `z.infer` (output type) -- must use `z.input` for form types

## User Setup Required
None - all components are frontend-only and consume the API endpoints built in 02-02.

## Next Phase Readiness
- Client list and forms are ready for use
- Client detail page (/clients/[id]) needs to be built in a future plan (currently placeholder from layout routing)
- Policy management UI (02-04) can run in parallel as it writes to different file paths
- Timeline & Notes (02-05) can consume client list navigation (click client name -> detail page)

## Self-Check: PASSED
