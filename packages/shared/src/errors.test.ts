import { describe, expect, it } from 'vitest';

import { errorEnvelopeSchema } from './errors';
import { healthResponseSchema } from './health';

describe('api contracts', () => {
  it('accepts a health response', () => {
    expect(healthResponseSchema.parse({ data: { status: 'ok' } })).toEqual({
      data: { status: 'ok' },
    });
  });

  it('rejects an unknown error code', () => {
    const parsed = errorEnvelopeSchema.safeParse({
      error: { code: 'SOMETHING_ELSE', message: 'No', requestId: 'req_1' },
    });

    expect(parsed.success).toBe(false);
  });
});
