import { defineConfig } from 'drizzle-kit';

import { loadRootEnv } from './src/config/load-env-file';
import { validateEnv } from './src/config/env';

loadRootEnv();
const env = validateEnv(process.env);

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: { url: env.DATABASE_URL },
});
