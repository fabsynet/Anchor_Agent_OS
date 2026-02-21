# Phase 2: Client & Policy Management - Context

**Gathered:** 2026-02-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage their book of business — clients, leads, and policies with full profiles. Includes client CRUD, lead-to-client workflow, activity timelines with notes, and policy records linked to clients. Documents, tasks, and renewals are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Client profiles & list view
- Toggle between table rows and cards grid on the clients list page (user can switch)
- Blended key fields: name, phone, status (Lead/Client), policy count, next renewal date
- Search bar plus filter dropdowns (status, policy type, etc.)
- Client detail/profile page uses tabbed sections: Overview, Policies, Timeline/Notes, Documents (future)

### Lead-to-Client workflow
- Lead requires minimal data: just name + email or phone
- Client requires full contact details: name, email, phone, address, DOB, etc.
- Conversion: auto-convert to Client when first policy is added, AND manual "Convert to Client" button available
- Reversal allowed: can set a Client back to Lead if relationship didn't work out
- Separate tabs on the clients list: "Clients" tab and "Leads" tab

### Activity timeline & notes
- Everything tracked: client created, status changed, policy added/updated/expired, note added, email sent, task created/completed, document uploaded, invitation sent
- Notes are plain text only — quick to add, easy to scan
- Everything immutable: auto-logged events are permanent, notes cannot be deleted (corrections can be added)
- Default view is compact list (icon + description + timestamp), with option to switch to expanded cards

### Policy structure & display
- Policy types: standard Canadian set (Auto, Home, Life, Health, Commercial, Travel, Umbrella) PLUS custom/other with free text
- Detailed status lifecycle: Draft → Active → Pending Renewal → Renewed/Expired/Cancelled
- Display on client profile: summary cards by default (type icon, carrier, premium, expiry, status badge) with toggle to table rows
- Full detail fields: type, carrier, policy number, start/end date, premium, status, coverage amount, deductible, payment frequency, broker commission, notes

### Claude's Discretion
- Exact card/table component styling and spacing
- Filter dropdown options and behavior
- Tab ordering and icons on profile page
- Timeline event icon design
- Policy type icons
- Form validation UX (inline vs summary)

</decisions>

<specifics>
## Specific Ideas

- User prefers toggle-able views (table/cards) on both client list and policy list — consistent pattern
- Compact-by-default with expand option is a recurring preference (timeline, policy display)
- Immutable timeline serves as compliance audit trail for insurance regulators
- Canadian insurance context: types, carriers, and terminology should reflect Canadian market

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-client-and-policy-management*
*Context gathered: 2026-02-21*
