import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { authUserSchema, type AuthUser } from 'shared';

import { UnauthenticatedError } from '../common/app-error';
import { AUTH, type AuthServer } from './auth.tokens';
import { IS_PUBLIC } from './public.decorator';
import { headersFrom } from './request-headers';

export type RequestWithUser = Request & { authUser?: AuthUser };

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AUTH) private readonly auth: AuthServer,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const session: unknown = await this.auth.api.getSession({ headers: headersFrom(request) });
    const user = session && typeof session === 'object' && 'user' in session ? session.user : undefined;
    const parsed = authUserSchema.safeParse(user);
    if (!parsed.success) throw new UnauthenticatedError();
    request.authUser = parsed.data;
    return true;
  }
}
