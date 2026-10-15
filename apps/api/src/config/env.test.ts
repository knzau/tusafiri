import { describe, expect, it } from 'vitest';

import { validateEnv } from './env';

const valid = {
  DATABASE_URL: 'postgres://tusafiri:tusafiri@localhost:5432/tusafiri',
  WEB_ORIGIN: 'http://localhost:3000',
};

describe('validateEnv', () => {
  it('fills the local defaults', () => {
    expect(validateEnv(valid)).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3001,
      WEB_ORIGIN: 'http://localhost:3000',
    });
  });

  it('rejects a missing database url', () => {
    expect(() => validateEnv({ WEB_ORIGIN: 'http://localhost:3000' })).toThrow(
      /Invalid environment/
    );
  });

  it('rejects a trailing slash on the web origin', () => {
    expect(() => validateEnv({ ...valid, WEB_ORIGIN: 'http://localhost:3000/' })).toThrow(
      /no trailing slash/
    );
  });
});
