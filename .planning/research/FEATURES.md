# Feature Landscape: Insurance Agent Operating System

**Domain:** Insurance agency management / CRM / operating system
**Researched:** 2026-02-05
**Overall confidence:** MEDIUM

---

## Competitor Landscape Overview

| Platform | Target Market | Price Range (USD) | Positioning |
|----------|---------------|-------------------|-------------|
| **Applied Epic** | Mid-to-large brokerages | $150-300+/user/mo | Enterprise AMS, carrier integrations, full back-office |
| **Vertafore AMS360** | Mid-to-large agencies | $150-250+/user/mo | Enterprise AMS, deep P&C workflows |
| **HawkSoft** | Small-to-mid agencies | $89-150/user/mo | User-friendly AMS, strong P&C focus |
| **EZLynx** | Small-to-mid agencies | $100-200/user/mo | Rating engine + AMS, comparative quoting |
| **AgencyBloc** | Health/life/benefits agencies | $70-130/user/mo | Health/benefits focus, commission tracking |
| **NowCerts** | Small agencies | $49-99/user/mo | Cloud-native, affordable AMS |
| **Better Agency** | Independent agents | $99-199/agent/mo | CRM-focused, marketing automation |
| **InsuredMine** | Independent agents | $69-149/user/mo | CRM + analytics + marketing |

**Where Anchor fits:** Anchor at $79-$129 CAD/month is price-competitive with NowCerts and InsuredMine. Its differentiator is purpose-built for Canadian agents with a "quiet failure prevention" philosophy rather than trying to be an enterprise AMS or a generic CRM with insurance bolted on.

---

## Table Stakes (Users Expect These)

### Contact / Client Management

| Feature | Why Expected | Complexity | Anchor MVP Status | Notes |
|---------|--------------|------------|-------------------|-------|
| Client database with search | Every competitor has it | Medium | PLANNED | Core of Client/CRM module |
| Client profile with contact info | Fundamental to insurance work | Low | PLANNED | Include province for Canada |
| Household / account grouping | Insurance is family-based | Medium | NOT PLANNED | Consider post-MVP |
| Lead vs. client distinction | Agents track prospects differently | Low | PLANNED | Lead → Client status |
| Activity/interaction history | Agents need to see what happened | Medium | PLANNED | Living client timeline |
| Notes on clients | Free-form context memory | Low | PLANNED | Part of client profiles |
| Contact import (CSV) | Switching tools requires data migration | Medium | NOT PLANNED | Critical for adoption |

### Policy Management

| Feature | Why Expected | Complexity | Anchor MVP Status |
|---------|--------------|------------|-------------------|
| Policy records linked to clients | Core of insurance work | Medium | PLANNED |
| Policy types (auto, home, life, health, commercial) | Agents handle multiple lines | Low | PLANNED |
| Policy status (active, expired, cancelled, pending) | State at a glance | Low | PLANNED |
| Effective and expiration dates | Fundamental policy data | Low | PLANNED |
| Premium amounts | Track what clients pay | Low | PLANNED |
| Carrier / insurer name | Work with multiple carriers | Low | PLANNED |
| Renewal tracking and reminders | #1 pain point | Medium | PLANNED |
| Multi-policy per client | Clients have auto + home etc. | Low | PLANNED |

### Task / Activity Management

| Feature | Why Expected | Complexity | Anchor MVP Status |
|---------|--------------|------------|-------------------|
| Task creation and assignment | Track to-dos | Low | PLANNED |
| Due dates and reminders | Without reminders, tasks forgotten | Low | PLANNED |
| Task linked to client/policy | Context matters | Low | PLANNED |
| Task status tracking | Track completion | Low | PLANNED |
| Overdue task visibility | Core to quiet failure prevention | Low | PLANNED |

### Document Management

| Feature | Why Expected | Complexity | Anchor MVP Status |
|---------|--------------|------------|-------------------|
| Document upload | Store declarations, IDs, applications | Medium | PLANNED |
| Documents linked to clients/policies | Retrievable in context | Low | PLANNED |
| Document categories/types | Organize by type | Low | NOT EXPLICIT |

### Dashboard / Daily Workflow

| Feature | Why Expected | Complexity | Anchor MVP Status |
|---------|--------------|------------|-------------------|
| Daily overview dashboard | "What needs attention?" | Medium | PLANNED |
| Upcoming renewals view | Time-sensitive, high-value | Low | PLANNED |
| Overdue items | Prevent quiet failures | Low | PLANNED |
| Quick actions | Reduce clicks | Low | PLANNED |
| Calendar view | Visual timeline | Medium | NOT PLANNED |

---

## Differentiators (Competitive Advantage)

### Anchor's Planned Differentiators

| Feature | Value Proposition | Complexity | Competitive Comparison |
|---------|-------------------|------------|------------------------|
| **Quiet failure prevention philosophy** | No task silently slips | Design philosophy | Unique positioning |
| **Today Dashboard as daily driver** | "What needs attention?" instantly | Medium | Anchor's is primary interface |
| **Renewal auto-tasks at 60/30/7** | Automated without configuration | Medium | Most competitors require manual setup |
| **Public Agent Badge page** | Professional digital presence | Medium | No competitor offers this |
| **Client trust layer** | Built-in reputation management | Medium | Novel for insurance tools |
| **Integrated expense/budget tracking** | Financial awareness alongside CRM | Medium | Unique combination |
| **Canada-first design** | Province-aware, CAD, compliance | Low | Most competitors are US-first |
| **Compliance activity log** | Lightweight audit trail | Medium | Enterprise AMS have it; small-agent tools don't |

---

## Anti-Features (Do NOT Build)

| Anti-Feature | Why Avoid | What To Do Instead |
|--------------|-----------|-------------------|
| **Comparative rating/quoting** | Enormous complexity, requires carrier APIs per province | Link out to carrier portals |
| **Commission reconciliation** | Requires carrier statement imports, complex matching | Correctly out of scope |
| **Full accounting system** | QuickBooks' job | Expense tracking + budgets sufficient |
| **Carrier API integrations** | Each carrier different; Canadian fragmentation worse | Manual policy entry is fine |
| **Built-in email inbox** | Full IMAP/SMTP client is complex | Log emails manually |
| **Marketing automation suite** | Mailchimp territory | Anchor is operations, not marketing |
| **Claims management workflow** | Agent's role is limited in claims | Allow notes only |
| **Advanced workflow builder** | Hard to build, rarely used by small agents | Opinionated built-in workflows |
| **Multi-language in MVP** | Adds complexity everywhere | English MVP, architect for i18n |

---

## Feature Dependencies

```
FOUNDATION LAYER (must build first)
  Auth + Multi-tenancy
    ├── User roles (Admin + Invited)
    └── Client/Contact Database
          ├── Lead vs Client status
          ├── Client Timeline
          ├── Policy Records
          │     ├── Renewal Engine (depends on policy dates)
          │     │     ├── Auto-tasks at 60/30/7
          │     │     └── Renewal dashboard widget
          │     └── Document linking to policies
          ├── Task System
          │     ├── Dashboard overdue tasks widget
          │     └── Email notifications
          ├── Document Upload
          ├── Notes
          └── Compliance Activity Log

PARALLEL TRACKS (after foundation)

  Track A: Financial
    Expense Tracking → Receipt Upload → Monthly Budgets → Budget Alerts → Dashboard Widget

  Track B: Trust Layer
    Testimonial Requests → Client Feedback/Surveys → Public Agent Badge Page

  Track C: Analytics
    Light Analytics (depends on client + policy + task data)
```

**Critical:** Today Dashboard must be built incrementally — skeleton early, widgets added as modules come online.

---

## Competitor Feature Matrix

| Feature Area | Applied Epic | HawkSoft | AgencyBloc | NowCerts | InsuredMine | **Anchor MVP** |
|-------------|-------------|----------|------------|----------|-------------|----------------|
| Client Management | Full | Full | Full | Full | Full | Full |
| Household Grouping | Yes | Yes | Yes | Yes | Yes | **No** |
| Policy Management | Full | Full | Basic | Full | Basic | Full |
| Renewal Tracking | Yes | Yes | Yes | Yes | Yes | **Yes (automated)** |
| Task Management | Yes | Yes | Yes | Yes | Yes | Yes |
| Document Management | Full | Full | Basic | Full | Basic | Basic |
| Commission Tracking | Yes | Yes | **Core** | Yes | Yes | No |
| Reporting | Advanced | Moderate | Moderate | Basic | Advanced | Basic |
| Expense/Budget | No | No | No | No | No | **Unique** |
| Public Agent Page | No | No | No | No | No | **Unique** |
| Trust/Testimonials | No | No | No | No | Survey | **Unique** |
| Canada-First | Via config | No | No | No | No | **Core** |

---

## MVP Feature Priority

### P1 — Must Have for Launch
1. Auth + multi-tenancy + user roles
2. Client database with search and profiles
3. Lead vs Client status system
4. Policy records (type, carrier, number, dates, premium, status)
5. Renewal tracking with auto-tasks at 60/30/7
6. Task system tied to clients/policies
7. Today Dashboard (renewals, overdue tasks, quick actions)
8. Document upload linked to clients/policies
9. Email notifications
10. Client activity timeline

### P2 — Strong Differentiators (Include in MVP)
11. Compliance activity log
12. Expense tracking with receipt uploads
13. Monthly budgets with alerts
14. Light analytics
15. Public Agent Badge page
16. Testimonial requests + client feedback

### P3 — Add Soon After Launch
17. CSV contact/policy import
18. Document type/category tagging
19. Household/account grouping
20. Email templates
21. Calendar view
22. Report export (CSV/PDF)
23. Recurring tasks

---

## Canadian Market Considerations

| Consideration | Impact | Recommendation |
|---------------|--------|----------------|
| Province-based licensing | Track which provinces agent is licensed in | Add to agent profile |
| FSRA / AMF / provincial regulators | Different per province | Compliance log should note regulatory body |
| CAD currency | All financial fields | Default CAD, store currency code |
| Bilingual (English/French) | Quebec market | English MVP, architect for i18n |
| PIPEDA privacy | Client data storage/sharing | Privacy-conscious design |
| Fewer carrier APIs | Canadian carriers less API infrastructure | Validates no carrier integration for MVP |

---
*Feature research for: Insurance Agent Operating System*
*Researched: 2026-02-05*
