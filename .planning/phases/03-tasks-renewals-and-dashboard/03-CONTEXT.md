# Phase 3: Tasks, Renewals & Dashboard - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

The system actively prevents quiet failures by auto-generating renewal tasks from policy expiration dates, providing a task management system for manual and automated tasks, surfacing what needs attention on a Today Dashboard, and sending daily digest emails. This phase builds on Phase 2's client and policy data.

</domain>

<decisions>
## Implementation Decisions

### Task workflow & statuses
- Four statuses: To Do -> In Progress -> Waiting -> Done
- "Waiting" captures tasks blocked on client/carrier response
- Status transitions are unrestricted (any status to any status)

### Task priorities
- Four levels: Low, Medium, High, Urgent
- Urgent is for critical items (same-day renewal, client escalation)
- Auto-generated renewal tasks use escalating priority (see Renewal section)

### Task display
- Tasks page supports both list view and kanban board with a toggle (consistent with client list table/card pattern)
- List view: sortable/filterable table with status, priority, due date, client, policy columns
- Kanban view: columns for each status, tasks as cards

### Manual task creation
- Fields: Title, description (text), due date, priority, status, assignee, linked client (optional), linked policy (optional)
- Assignee field allows assigning to any team member in the agency
- Quick creation from dashboard uses same form

### Renewal automation
- Auto-generates 3 renewal tasks per policy: at 60, 30, and 7 days before expiration
- Escalating priority: 60-day = Medium, 30-day = High, 7-day = Urgent
- Auto-generated tasks are dismissible only (mark done or dismiss, cannot edit content/dates)
- When policy expiration date changes: delete all pending renewal tasks and regenerate fresh
- When policy is cancelled or deleted: auto-delete all pending renewal tasks (no orphans)

### Dashboard layout
- Top row: 4 summary cards
  - Overdue Tasks (count, red if > 0)
  - Due Today (count)
  - Renewals in 30 Days (count)
  - Active Clients (count)
- Quick actions bar: Add Client, Add Task, Add Policy, Add Expense
  - Note: Add Expense button exists but routes to future Phase 5 page (placeholder until then)
- Three detail sections below cards:
  1. Upcoming Renewals table (policy, client, expiry date, days remaining)
  2. Overdue Tasks list (title, client, due date, priority)
  3. Recent Activity feed (new clients, completed tasks, policy changes)
- Premium Income section: Current Month total + YTD total + trend indicator (sparkline or % change vs previous month)

### Email notifications
- Single combined daily digest email with two sections: renewal milestones + overdue tasks
- Sent at 8 AM local time (start of business)
- Per-user opt-out toggle in settings (on by default)
- Uses Resend for delivery (already configured from Phase 1 invitations)

### Claude's Discretion
- Kanban card design and information density
- Exact dashboard responsive layout (grid breakpoints, stacking on mobile)
- Loading states and empty states for dashboard widgets
- Email template design and copy
- Cron job scheduling approach for renewal task generation and digest sending
- Recent activity feed: which events to include and how many to show
- Trend calculation method for premium income (simple % change vs sparkline)

</decisions>

<specifics>
## Specific Ideas

- Task list/kanban toggle should follow the same UI pattern as the client list's table/card toggle
- "Waiting" status is specifically for when the agent is blocked on someone else (client hasn't responded, carrier processing, etc.)
- Premium income is calculated from policy premium amounts already in the database (no new data entry needed)
- The "no quiet failures" philosophy: the system should make it harder to miss a renewal than to catch it

</specifics>

<deferred>
## Deferred Ideas

- Expense summary widget on dashboard (YTD + current month) -- add when Phase 5 builds expense tracking (DASH-03)
- Configurable digest send time per user -- keep 8 AM fixed for MVP, make configurable later
- Task recurrence / repeating tasks -- not in current scope

</deferred>

---

*Phase: 03-tasks-renewals-and-dashboard*
*Context gathered: 2026-02-21*
