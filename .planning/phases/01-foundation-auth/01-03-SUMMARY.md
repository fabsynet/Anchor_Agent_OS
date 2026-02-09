---
phase: 01-foundation-auth
plan: 03
subsystem: nestjs-backend-auth
tags: [nestjs, passport-jwt, supabase, prisma, multi-tenancy, cls, rbac, guards, decorators]
requires:
  - 01-01 (Prisma schema, monorepo structure, NestJS scaffold, nestjs-cls, passport-jwt)
provides:
  - Supabase JWT authentication strategy for NestJS
  - Role-based authorization guard (admin/agent)
  - Tenant-scoped Prisma client via CLS AsyncLocalStorage
  - Custom decorators (@CurrentUser, @TenantId, @Roles)
  - Auth controller with GET/PATCH /api/auth/me
  - Users controller with GET /api/users (admin-only) and setup-complete endpoint
  - Supabase admin client config for server-side operations
  - Global validation pipe with class-validator
  - Global 'api' route prefix
affects:
  - 01-05 (invitation endpoints will use JwtAuthGuard, RolesGuard, PrismaService.tenantClient)
  - 02-xx (all future API endpoints will use auth guards, tenant-scoped Prisma, decorators)
tech-stack:
  added: []
  patterns:
    - Passport JWT strategy with custom Supabase claim extraction (tenant_id, user_role)
    - CLS-based tenant context (AsyncLocalStorage via nestjs-cls)
    - Prisma Client Extensions for automatic tenant query filtering
    - Role-based access control via NestJS Reflector + custom guard
    - Controller-level guard application with decorator composition
key-files:
  created:
    - apps/api/src/common/prisma/prisma.service.ts
    - apps/api/src/common/prisma/prisma.module.ts
    - apps/api/src/common/prisma/prisma-tenant.extension.ts
    - apps/api/src/common/config/supabase.config.ts
    - apps/api/src/auth/strategies/supabase.strategy.ts
    - apps/api/src/auth/guards/jwt-auth.guard.ts
    - apps/api/src/auth/guards/roles.guard.ts
    - apps/api/src/auth/decorators/current-user.decorator.ts
    - apps/api/src/auth/decorators/tenant-id.decorator.ts
    - apps/api/src/auth/decorators/roles.decorator.ts
    - apps/api/src/auth/auth.module.ts
    - apps/api/src/auth/auth.controller.ts
    - apps/api/src/auth/auth.service.ts
    - apps/api/src/auth/dto/update-profile.dto.ts
    - apps/api/src/users/users.module.ts
    - apps/api/src/users/users.controller.ts
    - apps/api/src/users/users.service.ts
  modified:
    - apps/api/src/main.ts
    - apps/api/src/app.module.ts
    - apps/api/package.json
  deleted:
    - apps/api/src/app.controller.ts
    - apps/api/src/app.service.ts
    - apps/api/src/app.controller.spec.ts
decisions:
  - "Auth profile endpoints (/auth/me) use raw PrismaClient (not tenant-scoped) since they look up by user ID from JWT, not by tenant scan"
  - "UsersService.findByTenant uses tenant-scoped client; findById and updateSetupCompleted use raw client with direct ID lookup"
  - "UpdateProfileDto limits firstName/lastName to 100 chars and avatarUrl to 500 chars via class-validator"
  - "Added @prisma/client as direct dependency of api package (pnpm strict mode requires explicit dependencies)"
metrics:
  duration: ~15 minutes
  completed: 2026-02-09
---

# Phase 01 Plan 03: NestJS Backend Foundation Summary

NestJS backend with Supabase JWT auth (passport-jwt), CLS-based tenant isolation via Prisma Client Extensions, role-based guards, and user profile/admin endpoints.

## What Was Built

### Task 1: Prisma Service with Tenant Extension, CLS, and Supabase Config

Established the core data access infrastructure for the NestJS backend:

- **PrismaService** extends PrismaClient with a `tenantClient` getter that reads the current tenant ID from CLS (AsyncLocalStorage) and returns a Prisma client with auto-injected tenant filtering on all queries
- **PrismaModule** is marked `@Global()` so all modules can inject PrismaService without importing it
- **Tenant Extension** overrides findMany, findFirst, create, update, and delete on all models to automatically add/inject tenantId (findUnique is intentionally excluded since it only accepts unique field filters)
- **Supabase Admin Config** exports a factory function for creating a Supabase admin client with the service role key (for server-side operations like inviteUserByEmail)
- **main.ts** updated with global 'api' prefix, CORS, and validation pipe
- **app.module.ts** wired with ConfigModule (global), ClsModule (middleware mount), PrismaModule, AuthModule, UsersModule

### Task 2: Supabase JWT Strategy, Auth Guards, Decorators, and User Endpoints

Built the complete authentication and authorization layer:

- **SupabaseStrategy** verifies JWTs using SUPABASE_JWT_SECRET, extracts sub (user ID), email, tenant_id, and user_role from custom claims injected by the Supabase custom_access_token_hook
- **JwtAuthGuard** extends Passport's AuthGuard, and after successful validation, sets tenantId in the CLS context for downstream tenant-scoped queries
- **RolesGuard** reads required roles from metadata (set by @Roles decorator) via Reflector and returns 403 if the user's role does not match
- **Decorators**: @CurrentUser() extracts the full user or a specific property, @TenantId() extracts tenantId, @Roles() sets metadata for RolesGuard
- **AuthController**: GET /api/auth/me returns user profile with tenant, PATCH /api/auth/me updates profile fields
- **UsersController**: GET /api/users (admin-only, tenant-scoped), PATCH /api/users/:id/setup-complete
- **AuthService/UsersService**: Clean service layer with proper NotFoundException handling
- Removed unused boilerplate (AppController, AppService, spec)

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Prisma service with tenant extension, CLS, Supabase config | 911dc84 | prisma.service.ts, prisma.module.ts, prisma-tenant.extension.ts, supabase.config.ts, main.ts, app.module.ts |
| 2 | Supabase JWT strategy, auth guards, decorators, user endpoints | 3303c99 | supabase.strategy.ts, jwt-auth.guard.ts, roles.guard.ts, decorators/*, auth.controller.ts, users.controller.ts |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @prisma/client as direct dependency of api package**
- **Found during:** Task 1
- **Issue:** pnpm strict mode prevents api from importing @prisma/client even though @anchor/database (a workspace dependency) depends on it. Node resolution under pnpm requires explicit dependencies.
- **Fix:** Added @prisma/client directly to apps/api/package.json dependencies
- **Files modified:** apps/api/package.json, pnpm-lock.yaml
- **Commit:** 911dc84

**2. [Rule 1 - Bug] Fixed TypeScript strict cast error in JwtAuthGuard**
- **Found during:** Task 2 build verification
- **Issue:** TypeScript reported TS2352 when casting generic `TUser` to `AuthenticatedUser` in handleRequest - types don't overlap sufficiently
- **Fix:** Used `as unknown as AuthenticatedUser` double cast (standard pattern for generic-to-concrete casts in Passport guards)
- **Files modified:** apps/api/src/auth/guards/jwt-auth.guard.ts
- **Commit:** 3303c99

**3. [Rule 2 - Missing Critical] Added UpdateProfileDto with validation**
- **Found during:** Task 2
- **Issue:** PATCH /api/auth/me needs input validation to prevent arbitrary field injection
- **Fix:** Created UpdateProfileDto with @IsOptional, @IsString, @MaxLength validators
- **Files modified:** apps/api/src/auth/dto/update-profile.dto.ts
- **Commit:** 3303c99

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Auth profile endpoints use raw PrismaClient, not tenant-scoped | /auth/me looks up by user ID from JWT (known identity), not by tenant scan. Tenant scoping is for list/search operations. |
| findByTenant uses tenantClient; findById uses raw client | Direct ID lookups don't need tenant filtering (the ID is unique). Tenant scoping prevents unauthorized list access. |
| Added @prisma/client as direct api dependency | pnpm strict mode requires explicit declaration. Relying on transitive resolution from @anchor/database would break. |
| Removed boilerplate AppController/AppService | No longer needed; replaced by AuthController and UsersController. |
| ParseUUIDPipe on :id params | Validates UUID format before hitting the database, preventing invalid query errors. |

## Verification

- `pnpm --filter api build` compiles with zero TypeScript errors
- SupabaseStrategy correctly references SUPABASE_JWT_SECRET from ConfigService
- JwtAuthGuard sets tenantId in CLS via cls.set('tenantId', ...)
- RolesGuard uses Reflector to read ROLES_KEY metadata
- AuthController exposes GET /api/auth/me and PATCH /api/auth/me
- UsersController exposes GET /api/users with @Roles('admin') and PATCH /api/users/:id/setup-complete
- All modules wired: AppModule imports ConfigModule, ClsModule, PrismaModule, AuthModule, UsersModule

## Next Phase Readiness

**Ready for:**
- Plan 01-05 (Invitations): JwtAuthGuard, RolesGuard, PrismaService.tenantClient, and Supabase admin config are all in place for building invitation CRUD endpoints
- Plan 01-04 (App Shell): /api/auth/me endpoint is available for frontend to fetch the current user profile

**Prerequisites for runtime testing:**
- SUPABASE_JWT_SECRET must be set in .env
- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for admin operations
- Database must be migrated with Prisma schema (users, tenants tables)
- Supabase custom_access_token_hook must be configured to inject tenant_id and user_role claims

## Self-Check: PASSED
