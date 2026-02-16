import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ClsService } from 'nestjs-cls';

export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string | undefined;
  role: string | undefined;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(
    private readonly cls: ClsService,
    configService: ConfigService,
  ) {
    const supabaseUrl = configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    const serviceRoleKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required',
      );
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const token = authHeader.substring(7);

    // Validate token with Supabase (server-side verification)
    const {
      data: { user: supabaseUser },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Decode JWT payload to get custom claims (tenant_id, user_role from custom_access_token_hook)
    let tenantId: string | undefined;
    let userRole: string | undefined;

    try {
      const payloadB64 = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
      tenantId = payload.tenant_id;
      userRole = payload.user_role;
    } catch {
      // If decoding fails, fall back to user metadata
    }

    // Fall back to user_metadata if custom claims not in JWT
    if (!tenantId) {
      tenantId = supabaseUser.user_metadata?.tenant_id;
    }
    if (!userRole) {
      userRole = supabaseUser.user_metadata?.invitation_id ? 'agent' : 'admin';
    }

    const authenticatedUser: AuthenticatedUser = {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      tenantId,
      role: userRole,
    };

    // Attach user to request
    request.user = authenticatedUser;

    // Set tenantId in async-local storage for PrismaService.tenantClient
    if (authenticatedUser.tenantId) {
      this.cls.set('tenantId', authenticatedUser.tenantId);
    }

    return true;
  }
}
