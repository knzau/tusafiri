import { HttpException } from '@nestjs/common';
import { errorEnvelopeSchema, type ErrorCode, type ErrorEnvelope } from 'shared';
import { ZodError } from 'zod';

import { AppError } from './app-error';

const messages = {
  VALIDATION_ERROR: 'Some fields are invalid.',
  UNAUTHENTICATED: 'Sign in is required.',
  FORBIDDEN: 'You cannot do that.',
  NOT_FOUND: 'Not found.',
  CONFLICT: 'That conflicts with the current state.',
  RATE_LIMITED: 'Too many requests.',
  NOT_READY: 'Database is unavailable.',
  INTERNAL_ERROR: 'Something went wrong.',
} as const satisfies Record<ErrorCode, string>;

export type ErrorBody = {
  status: number;
  envelope: ErrorEnvelope;
};

export function toErrorBody(exception: unknown, requestId: string): ErrorBody {
  if (exception instanceof AppError) {
    return body(exception.status, exception.code, exception.message, requestId, exception.details);
  }

  if (exception instanceof ZodError) {
    return body(
      400,
      'VALIDATION_ERROR',
      messages.VALIDATION_ERROR,
      requestId,
      exception.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    );
  }

  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const code = codeForStatus(status);
    return body(status, code, messages[code], requestId);
  }

  return body(500, 'INTERNAL_ERROR', messages.INTERNAL_ERROR, requestId);
}

function codeForStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHENTICATED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMITED';
    case 503:
      return 'NOT_READY';
    default:
      return 'INTERNAL_ERROR';
  }
}

function body(
  status: number,
  code: ErrorCode,
  message: string,
  requestId: string,
  details?: { path: string; message: string }[],
): ErrorBody {
  const envelope = errorEnvelopeSchema.parse({
    error: {
      code,
      message,
      requestId,
      ...(details !== undefined && details.length > 0 ? { details } : {}),
    },
  });
  return { status, envelope };
}
