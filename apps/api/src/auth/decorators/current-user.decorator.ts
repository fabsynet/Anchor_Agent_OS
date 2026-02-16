import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../guards/jwt-auth.guard.js';

/**
 * Extracts the current authenticated user from the request.
 *
 * Usage:
 *   @CurrentUser() user: AuthenticatedUser       -- full user object
 *   @CurrentUser('id') userId: string             -- specific property
 *   @CurrentUser('email') email: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    return data ? user?.[data] : user;
  },
);
