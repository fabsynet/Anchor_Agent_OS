---
phase: 02-client-and-policy-management
plan: 04
subsystem: ui
tags: [nextjs, react, timeline, tabs, date-fns, lucide-react, sonner, shadcn]

# Dependency graph
requires:
  - phase: 02-client-and-policy-management/02-01
    provides: Shared types (Client, ActivityEvent, Note), Zod schemas, shadcn Tabs/AlertDialog/Textarea/ScrollArea, date-fns
  - phase: 02-client-and-policy-management/02-02
    provides: API endpoints (GET /api/clients/:id, PATCH /api/clients/:id/convert, DELETE /api/clients/:id, GET /api/clients/:id/timeline, POST /api/clients/:id/notes)
provides:
  - Client profile page at /clients/[id] with tabbed sections
  - Profile header with avatar, status badge, Edit/Convert/Delete actions
  - Overview tab with formatted contact info and summary stats
  - Timeline/Notes tab with compact/expanded views and note creation
  - Reusable timeline components (ActivityIcon, TimelineList, TimelineExpanded, NoteForm)
  - Placeholder tabs for Policies and Documents (to be filled by 02-05 and Phase 4)
affects:
  - 02-05 (Timeline & Notes -- may extend or consume timeline components)
  - Phase 4 (Documents -- will fill Documents placeholder tab)
  - Any future plan that needs client profile navigation

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js 16 dynamic route params via Promise + React.use() in client components"
    - "TimelineItem union type with kind discriminator for merged event/note timeline"
    - "Compact/expanded view toggle pattern for timeline (reusable)"
    - "InfoRow pattern for consistent key-value display with icons"

key-files:
  created:
    - apps/web/src/app/(dashboard)/clients/[id]/page.tsx
    - apps/web/src/components/clients/client-profile-header.tsx
    - apps/web/src/components/clients/client-overview-tab.tsx
    - apps/web/src/components/clients/client-timeline-tab.tsx
    - apps/web/src/components/timeline/activity-icon.tsx
    - apps/web/src/components/timeline/note-form.tsx
    - apps/web/src/components/timeline/timeline-list.tsx
    - apps/web/src/components/timeline/timeline-expanded.tsx
  modified: []

key-decisions:
  - "Used React.use(params) for Next.js 16 dynamic route params in client components"
  - "TimelineItem type defined locally in client-timeline-tab and exported for child components"
  - "Compact timeline as default view with vertical connector line and icon circles"

patterns-established:
  - "Client profile page pattern: header + tabs + child components with refresh callback"
  - "Timeline compact/expanded toggle with shared TimelineItem type"
  - "InfoRow pattern for displaying labeled values with icons in Card layouts"

# Metrics
duration: 28min
completed: 2026-02-21
---

# Phase 2 Plan 4: Client Profile & Timeline UI Summary

**Client profile page at /clients/[id] with tabbed sections, overview stats, and immutable timeline/notes with compact/expanded views**

## Performance

- **Duration:** ~28 min
- **Started:** 2026-02-21T20:48:19Z
- **Completed:** 2026-02-21T21:16:01Z
- **Tasks:** 2/2
- **Files modified:** 8

## Accomplishments
- Client profile page with loading skeleton, 404 handling, and 4 tabbed sections (Overview, Policies, Timeline/Notes, Documents)
- Profile header with avatar initials, status badge, and Edit/Convert/Delete action buttons with AlertDialog confirmation
- Timeline/Notes tab with note creation form, compact list view (default) with vertical timeline line, and expanded card view toggle
- All 8 activity event types mapped to distinct lucide-react icons with fallback

## Task Commits

Each task was committed atomically:

1. **Task 1: Client profile page with header, overview tab, and convert button** - `282ba71` (feat)
2. **Task 2: Timeline/Notes tab with compact/expanded views and note form** - `7293508` (feat)

## Files Created/Modified
- `apps/web/src/app/(dashboard)/clients/[id]/page.tsx` - Client profile page with dynamic routing, loading skeleton, 404 handling, 4 tabs
- `apps/web/src/components/clients/client-profile-header.tsx` - Header with avatar initials, name, status badge, Edit/Convert/Delete buttons
- `apps/web/src/components/clients/client-overview-tab.tsx` - Contact info and summary stats with date-fns formatting, province label resolution
- `apps/web/src/components/clients/client-timeline-tab.tsx` - Timeline/Notes tab with pagination, compact/expanded toggle, note form integration
- `apps/web/src/components/timeline/activity-icon.tsx` - Maps 8 ActivityEventType values to lucide-react icons with Activity fallback
- `apps/web/src/components/timeline/note-form.tsx` - Plain text note creation form with validation and toast feedback
- `apps/web/src/components/timeline/timeline-list.tsx` - Compact timeline view with vertical connector line, icons, and relative timestamps
- `apps/web/src/components/timeline/timeline-expanded.tsx` - Expanded card view with full timestamps, author info, and metadata display

## Decisions Made
- **React.use(params) for Next.js 16 dynamic routes:** Next.js 16 passes params as a Promise. Since the page is a client component (needs useState/useEffect), used `React.use()` to unwrap the promise synchronously.
- **TimelineItem type defined locally and exported:** Rather than adding a new shared type, the merged event/note shape is defined in client-timeline-tab.tsx and imported by child components. This keeps the type close to where it's constructed from the API response.
- **Compact timeline as default with vertical line:** Default view shows a compact list with a vertical timeline line connecting events, consistent with the user's preference for compact-by-default views.

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
- Next.js build lock file race condition (parallel plan 02-03 running simultaneously) -- resolved by cleaning `.next` directory and retrying. No code changes needed.

## User Setup Required
None - no external service configuration required. These are frontend components consuming existing API endpoints.

## Next Phase Readiness
- Client profile page fully functional at /clients/[id] with all tabs
- Policies tab is a placeholder ready for Plan 02-05 to fill with policy cards/table
- Documents tab is a placeholder ready for Phase 4
- Timeline components (ActivityIcon, TimelineList, TimelineExpanded) are reusable for any future timeline display needs
- No blockers for remaining Phase 2 plans

## Self-Check: PASSED

All 8 created files verified present. Both commit hashes (282ba71, 7293508) verified in git log.
