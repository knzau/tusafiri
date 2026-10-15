import { type ArgumentsHost, Catch, type ExceptionFilter, Inject } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

import { AppError } from './app-error';
import { readRequestId } from './request-id';
import { toErrorBody } from './to-error-body';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestId = readRequestId(request);
    const { status, envelope } = toErrorBody(exception, requestId);

    if (exception instanceof AppError) {
      this.logger.warn({ requestId, code: exception.code }, exception.message);
    } else if (status >= 500) {
      this.logger.error({ requestId, err: exception }, 'Unhandled error');
    }

    response.status(status).json(envelope);
  }
}
