import { resolve } from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

import { loadRootEnv } from '../config/load-env-file';
import { validateEnv } from '../config/env';

export async function migrateDatabase(connectionString: string): Promise<void> {
  const pool = new Pool({ connectionString, max: 1 });
  try {
    const db = drizzle({ client: pool });
    await migrate(db, { migrationsFolder: resolve(process.cwd(), 'drizzle') });
  } finally {
    await pool.end();
  }
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  return entry !== undefined && (entry.endsWith('migrate.ts') || entry.endsWith('migrate.js'));
}

async function main(): Promise<void> {
  loadRootEnv();
  const env = validateEnv(process.env);
  await migrateDatabase(env.DATABASE_URL);
}

if (isDirectRun()) {
  void main();
}
