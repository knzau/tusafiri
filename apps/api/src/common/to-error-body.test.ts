import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { NotReadyError } from './app-error';
import { toErrorBody } from './to-error-body';

describe('toErrorBody', () => {
  it('keeps an application error code and hides nothing extra', () => {
    const result = toErrorBody(new NotReadyError(), 'req_1');

    expect(result.status).toBe(503);
    expect(result.envelope.error.code).toBe('NOT_READY');
    expect(result.envelope.error.requestId).toBe('req_1');
  });

  it('turns a schema failure into field details', () => {
    const error = new ZodError([
      { code: 'custom', path: ['destination'], message: 'Required', input: undefined },
    ]);

    const result = toErrorBody(error, 'req_2');

    expect(result.status).toBe(400);
    expect(result.envelope.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: [{ path: 'destination', message: 'Required' }],
    });
  });

  it('does not leak a framework message', () => {
    const result = toErrorBody(new NotFoundException('Cannot GET /secret'), 'req_3');

    expect(result.status).toBe(404);
    expect(result.envelope.error.message).toBe('Not found.');
    expect(JSON.stringify(result.envelope)).not.toContain('secret');
  });

  it('hides unexpected failures', () => {
    const result = toErrorBody(new Error('password hash leaked'), 'req_4');

    expect(result.status).toBe(500);
    expect(result.envelope.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(result.envelope)).not.toContain('password');
  });
});
