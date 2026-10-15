import { describe, expect, it } from 'vitest';

import { authSessionSchema } from './session';
import { tripSchema } from './trip';

describe('trip schema', () => {
  it('rejects an id that is not a uuid', () => {
    expect(tripSchema.safeParse({ id: 'lisbon', name: 'Lisbon' }).success).toBe(false);
  });
});

describe('auth session schema', () => {
  it('keeps the signed-in user fields', () => {
    const parsed = authSessionSchema.parse({
      user: { id: 'user-1', name: 'Ada', email: 'ada@example.com', image: null },
      session: { id: 'session-1' },
    });

    expect(parsed.user).toEqual({ id: 'user-1', name: 'Ada', email: 'ada@example.com' });
  });
});
