import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from 'shared';

import { UnauthenticatedError } from '../common/app-error';
import type { RequestWithUser } from './session.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.authUser) throw new UnauthenticatedError();
    return request.authUser;
  }
);
