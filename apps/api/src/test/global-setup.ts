import { Pool } from 'pg';

import { migrateDatabase } from '../db/migrate';
import { testDatabaseName, testDatabaseUrl } from './database-url';

export async function setup(): Promise<void> {
  const databaseUrl = testDatabaseUrl();
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  const admin = new Pool({ connectionString: adminUrl.toString(), max: 1 });
  try {
    await admin.query('select 1');
    if (!/^[a-z0-9_]+$/.test(testDatabaseName)) {
      throw new Error('Unsupported test database name.');
    }
    const existing = await admin.query('select 1 from pg_database where datname = $1', [
      testDatabaseName,
    ]);
    if (existing.rowCount === 0) {
      await admin.query(`create database ${testDatabaseName}`);
    }
  } catch (error) {
    throw new Error('Could not connect to Postgres for tests. Start it with pnpm db:up.', {
      cause: error,
    });
  } finally {
    await admin.end();
  }
  await migrateDatabase(databaseUrl);
}
