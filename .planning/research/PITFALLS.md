# Pitfalls Research

**Domain:** Insurance agent operating system (multi-tenant SaaS)
**Researched:** 2026-02-05
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Cross-Tenant Data Leakage

**What goes wrong:**
A query without `tenant_id` filtering returns or exposes data from another agency. Agency A sees Agency B's clients, policies, or documents.

**Why it happens:**
Developer forgets to add `WHERE tenant_id = ?` in a new query. Or a search feature scans all records. One missed filter in one endpoint is enough.

**How to avoid:**
- Prisma middleware that auto-injects `tenant_id` filter on every query
- Supabase Row Level Security (RLS) as a second safety net
- Code review checklist: "Does every query filter by tenant?"
- Integration tests that create two tenants and verify isolation

**Warning signs:**
- Any Prisma query without `where: { tenantId }` in code review
- Search results returning more records than expected
- Users reporting seeing unfamiliar client names

**Phase to address:** Phase 1 (Foundation) — must be baked into the architecture from day 1.

---

### Pitfall 2: Renewal Engine Silent Failures

**What goes wrong:**
The cron job that checks for upcoming renewals fails silently — no tasks are created, no emails sent. Agents discover missed renewals when it's too late. This is the exact "quiet failure" Anchor is supposed to prevent.

**Why it happens:**
- Cron job crashes and no one notices
- Database timeout during large scan
- Email service (Resend) rate limit hit, partial sends
- Timezone mismatch — renewals calculated in UTC but agents think in local time
- Policy date entered incorrectly (no validation)

**How to avoid:**
- Health check endpoint for the renewal cron job
- Logging: every run logs how many renewals checked, how many tasks created
- Dead man's switch: if renewal check hasn't run in 24 hours, alert admin
- Timezone handling: store dates in UTC, convert for display, run cron in UTC
- Policy date validation: expiration must be after effective date

**Warning signs:**
- Dashboard shows zero upcoming renewals (suspicious if agency has active policies)
- Cron job logs stop appearing
- Agents manually creating renewal tasks (means automation isn't working)

**Phase to address:** Phase 2 (Core Agent OS) — build with monitoring from the start.

---

### Pitfall 3: Supabase Auth + NestJS JWT Mismatch

**What goes wrong:**
Supabase Auth issues JWT tokens, but NestJS fails to verify them correctly — either rejecting valid tokens (users can't access) or accepting expired/invalid tokens (security hole).

**Why it happens:**
- Supabase JWT secret not correctly configured in NestJS
- Token refresh flow not handled — user's token expires mid-session
- Phone verification flow not properly integrated with user creation
- Supabase Auth session management conflicts with NestJS middleware

**How to avoid:**
- Use Supabase's JWKS endpoint for verification (not hardcoded secret)
- Implement token refresh middleware in Next.js (using `@supabase/ssr`)
- Test auth flow end-to-end: signup → verify email → verify phone → login → refresh → access API
- Keep auth logic in one place — don't split between Supabase hooks and NestJS

**Warning signs:**
- Users getting logged out randomly
- 401 errors in browser console after being idle
- Phone verification completing but user can't login

**Phase to address:** Phase 1 (Foundation) — auth must be solid before building anything on top.

---

### Pitfall 4: File Upload Security Gaps

**What goes wrong:**
Document uploads (policies, receipts, IDs) are stored without proper access control. Attackers enumerate storage URLs to access other agencies' documents. Or malicious files are uploaded (executable disguised as PDF).

**Why it happens:**
- Supabase Storage bucket set to public instead of private
- Signed URLs with excessively long expiry times
- No file type validation on upload
- No file size limits
- Storage paths predictable (sequential IDs)

**How to avoid:**
- All document buckets: **private**. Use short-lived signed URLs (15 min expiry) for downloads.
- Validate file types server-side (check MIME type AND file extension)
- Limit file sizes: documents 10MB, receipts 5MB, photos 2MB
- Storage paths include `tenant_id`: `documents/{tenant_id}/{client_id}/{nanoid}.pdf`
- Never expose Supabase storage URLs directly to the client — proxy through NestJS

**Warning signs:**
- Storage bucket policy shows `public: true`
- Signed URLs with expiry > 1 hour
- Upload endpoint accepts any file type

**Phase to address:** Phase 1 (Foundation) for storage setup, Phase 2 for document uploads.

---

### Pitfall 5: N+1 Query Performance Degradation

**What goes wrong:**
Dashboard loads slowly because each widget makes separate queries. Client list page with 200 clients makes 200 additional queries to count policies per client. It works fine with 10 clients but crawls with 100+.

**Why it happens:**
- Prisma's `include` used naively — eager-loading relations on list pages
- Dashboard fetches renewals, tasks, documents, expenses in separate sequential queries
- No pagination on list endpoints
- No database indexes on frequently queried columns

**How to avoid:**
- Use `select` instead of `include` — only fetch fields you need
- Dashboard: parallel queries (Promise.all) not sequential
- Always paginate list endpoints (default 25, max 100)
- Add indexes: `tenant_id`, `client_id`, `policy_id`, `due_date`, `status`
- Use Prisma's `_count` for relation counts instead of loading relations

**Warning signs:**
- Page load time > 2 seconds
- Database CPU spikes on list page loads
- Prisma query logs showing hundreds of queries per request

**Phase to address:** Phase 2 (Core Agent OS) — bake pagination and indexes in from the start.

---

### Pitfall 6: Email Deliverability for Critical Notifications

**What goes wrong:**
Renewal reminder emails land in spam. Budget alert emails never arrive. Agents don't know they have overdue tasks because notification emails are blocked.

**Why it happens:**
- No SPF/DKIM/DMARC configured for sending domain
- Sending from a new domain with no reputation
- Email content triggers spam filters (too many links, "urgent" language)
- No bounce/complaint handling — continued sending to bad addresses damages reputation

**How to avoid:**
- Set up custom domain with Resend (SPF, DKIM, DMARC records)
- Warm up the domain: start with transactional emails (welcome, verification) before bulk
- Keep email content clean: plain text + minimal HTML, clear sender name
- Handle bounces: mark bounced emails, stop sending to them
- Monitor delivery rates in Resend dashboard

**Warning signs:**
- Email delivery rate below 95%
- Users saying they never received emails
- High bounce rate in Resend analytics

**Phase to address:** Phase 1 (Foundation) for domain setup, monitored throughout.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip Prisma migrations, use `db push` | Faster iteration | No migration history, can't reproduce schema changes | Only in early development (Phase 1) |
| Hardcode renewal intervals (60/30/7) | Simple implementation | Can't customize per agency | Acceptable for MVP — make configurable later |
| Store all dates without timezone | Simpler code | Wrong renewal dates for agents in different timezones | Never — use UTC from day 1 |
| Skip input sanitization | Faster development | XSS/injection vulnerabilities | Never |
| No rate limiting on API | Simpler setup | API abuse, cost overruns | Only during local development |
| Single Supabase project for dev/prod | One thing to manage | Data contamination, accidental prod changes | Never — separate from the start |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth | Using `supabase.auth.getUser()` on every API request (hits Supabase API each time) | Verify JWT locally in NestJS using the JWT secret. Only call `getUser()` when you need fresh user data. |
| Supabase Storage | Using public buckets for convenience during development | Always use private buckets + signed URLs. Set policies correctly from day 1. |
| Prisma + Supabase | Using direct connection string in serverless environment | Use Supabase's connection pooler URL for serverless, direct URL for migrations only |
| Resend | Sending emails synchronously in request handlers | Queue emails — use NestJS @nestjs/bull or simple async. Don't block user requests on email sends. |
| Next.js + NestJS | Calling NestJS API from Next.js server components without auth propagation | Forward the Supabase session cookie/token from the Next.js request to the NestJS API call |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unindexed `tenant_id` columns | Slow queries as data grows | Add composite indexes: `(tenant_id, created_at)`, `(tenant_id, status)` | > 50 agencies |
| Loading full client timeline on profile open | Slow profile page, high memory | Paginate timeline, load recent 20 entries first | > 100 activities per client |
| Dashboard loads all data on mount | Slow initial dashboard load | Parallel data fetching + skeleton loading + cache | > 50 clients per agency |
| Cron scans all tenants sequentially | Renewal check takes too long | Batch processing with offset/limit, or per-tenant scheduling | > 200 agencies |
| Storing large files in Supabase Storage without thumbnails | Slow document browsing | Generate thumbnails for images on upload (sharp), use file type icons for documents | > 100 documents per agency |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing internal IDs in URLs | Enumeration attacks (increment ID to access others' data) | Use UUIDs or nanoids for public-facing IDs. Always validate tenant ownership. |
| No rate limiting on auth endpoints | Brute force password attacks | Rate limit login/signup: 5 attempts per minute per IP |
| Storing Supabase service role key in frontend | Full database access from browser | Service role key only on backend. Frontend uses anon key only. |
| No CORS configuration on NestJS | API accessible from any domain | Restrict CORS to your Next.js domain only |
| Badge page leaking private data | Agent's clients visible on public page | Badge API endpoint must only return curated public data — never query private tables |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Overloaded dashboard | Agents feel overwhelmed, stop using it | Progressive disclosure — show what's urgent, hide the rest behind "view all" |
| No empty states | New users see blank pages, don't know what to do | Helpful empty states with guided actions: "Add your first client" |
| Modal-heavy workflows | Agents lose context, can't multitask | Use slide-out panels or dedicated pages instead of modals |
| No keyboard shortcuts | Power users feel slow | Add shortcuts for common actions: `N` new client, `T` new task |
| Confusing onboarding | Agents abandon before setup completes | Progress indicator, save-and-resume, minimal required fields |
| Notification fatigue | Agents disable all notifications, miss critical ones | Categorize notifications: critical (renewal) vs. informational (budget update). Let agents control non-critical. |

## "Looks Done But Isn't" Checklist

- [ ] **Auth flow:** Test email verification + phone verification + password reset + session refresh end-to-end
- [ ] **Renewal engine:** Test with policies expiring in exactly 60/30/7 days, not just "sometime in the future"
- [ ] **Multi-tenancy:** Create two test agencies, verify zero data crossover in every feature
- [ ] **File uploads:** Test with max-size files, wrong file types, concurrent uploads
- [ ] **Budget alerts:** Test with budget at exactly 80% threshold, not just "over 80%"
- [ ] **Dashboard:** Test with 0 clients, 1 client, 50 clients, 200 clients — performance and layout
- [ ] **Public badge:** Test that no private data appears — no client names, no financial data
- [ ] **User roles:** Test invited user cannot access budget/expense features
- [ ] **Email notifications:** Verify emails actually arrive in inbox, not just "sent successfully"
- [ ] **Search:** Test with accented characters (Québec, José) — common in Canadian names

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Cross-tenant data leak | HIGH | Audit all queries, add Prisma middleware, add RLS, notify affected agencies |
| Renewal engine failure | MEDIUM | Run catch-up scan for missed renewals, send batch notifications, add monitoring |
| Auth token issues | MEDIUM | Clear all sessions, force re-login, fix token verification |
| File security breach | HIGH | Rotate storage keys, audit access logs, make all buckets private, regenerate signed URLs |
| N+1 performance | LOW | Add indexes, refactor queries, add pagination — can be done incrementally |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Cross-tenant data leak | Phase 1: Foundation | Integration tests with two tenants |
| Renewal silent failures | Phase 2: Core Agent OS | Health check endpoint, logging, dead man's switch |
| Auth mismatch | Phase 1: Foundation | E2E auth flow test |
| File upload security | Phase 1 (setup) + Phase 2 (implementation) | Penetration test on storage endpoints |
| N+1 queries | Phase 2: Core Agent OS | Load test with 200+ clients per agency |
| Email deliverability | Phase 1 (domain) + Phase 2 (sending) | Monitor delivery rates weekly |
| UX overload | Phase 4: Polish | User testing with real agent |

---
*Pitfalls research for: Insurance Agent Operating System*
*Researched: 2026-02-05*
