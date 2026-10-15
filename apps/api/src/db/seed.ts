import 'reflect-metadata';

import { Pool } from 'pg';

import { loadRootEnv } from '../config/load-env-file';
import { validateEnv } from '../config/env';

export async function seed(): Promise<void> {
  return Promise.resolve();
}

async function main(): Promise<void> {
  loadRootEnv();
  const env = validateEnv(process.env);
  const pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 });
  await pool.query('select 1');
  await seed();
  await pool.end();
}

void main();
