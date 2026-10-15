import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadRootEnv(): void {
  for (const file of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')]) {
    applyEnvFile(file);
  }
}

function applyEnvFile(file: string): void {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    if (key.length === 0 || process.env[key] !== undefined) continue;
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
