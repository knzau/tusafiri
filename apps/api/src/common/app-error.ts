import type { ErrorCode } from 'shared';

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: { path: string; message: string }[]
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthenticatedError extends AppError {
  constructor() {
    super(401, 'UNAUTHENTICATED', 'Sign in is required.');
  }
}

export class NotFoundError extends AppError {
  constructor() {
    super(404, 'NOT_FOUND', 'Not found.');
  }
}

export class NotReadyError extends AppError {
  constructor() {
    super(503, 'NOT_READY', 'Database is unavailable.');
  }
}
