import { defineConfig } from 'vitest/config';

import { testDatabaseUrl } from './src/test/database-url';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globalSetup: ['./src/test/global-setup.ts'],
    hookTimeout: 30_000,
    testTimeout: 20_000,
    env: {
      DATABASE_URL: testDatabaseUrl(),
      WEB_ORIGIN: 'http://localhost:3000',
      BETTER_AUTH_SECRET: '0123456789abcdef0123456789abcdef',
      GOOGLE_CLIENT_ID: 'test-google-client',
      GOOGLE_CLIENT_SECRET: 'test-google-secret',
      NODE_ENV: 'test',
    },
  },
});
