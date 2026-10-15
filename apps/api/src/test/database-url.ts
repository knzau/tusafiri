import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const testDatabaseName = 'tusafiri_test';

export function testDatabaseUrl(): string {
  const raw =
    process.env.DATABASE_URL ??
    readEnvValue('DATABASE_URL') ??
    'postgres://tusafiri:tusafiri@localhost:5432/tusafiri';
  const url = new URL(raw);
  url.pathname = `/${testDatabaseName}`;
  return url.toString();
}

function readEnvValue(key: string): string | undefined {
  for (const file of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith(`${key}=`)) continue;
      return trimmed.slice(key.length + 1).trim();
    }
  }
  return undefined;
}
