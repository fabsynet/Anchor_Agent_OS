# Issues Log

Tracks issues encountered during execution and their resolutions, organized by phase.

---

## Phase 1: Foundation & Auth

### ISS-001: useUser hook missing `/api` prefix on fetch URL
- **Plan:** 01-04 (App Shell)
- **File:** `apps/web/src/hooks/use-user.ts:43`
- **Symptom:** Runtime error when fetching user profile — request to `http://localhost:3001/auth/me` returns 404
- **Root cause:** NestJS has `setGlobalPrefix('api')` (set in `apps/api/src/main.ts:8`), so all endpoints are under `/api/*`. The `use-user.ts` hook used `/auth/me` instead of `/api/auth/me`.
- **Fix:** Changed fetch URL from `${apiUrl}/auth/me` to `${apiUrl}/api/auth/me`
- **Lesson:** Always use the `/api` prefix when calling NestJS endpoints directly. The `apps/web/src/lib/api.ts` wrapper expects callers to include `/api` in paths — follow the same convention in any raw fetch calls.

---

## Phase 2: Client & Policy Management

*(No issues yet)*

---

## Phase 3: Tasks, Renewals & Dashboard

*(No issues yet)*

---

## Phase 4: Documents & Compliance

*(No issues yet)*

---

## Phase 5: Expenses & Budgets

*(No issues yet)*

---

## Phase 6: Trust & Reputation

*(No issues yet)*

---

## Phase 7: Analytics, Import & Polish

*(No issues yet)*
