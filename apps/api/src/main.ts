import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';

import { createApp } from './bootstrap';
import type { Env } from './config/env';

async function main(): Promise<void> {
  const app = await createApp();
  const config = app.get(ConfigService<Env, true>);
  await app.listen(config.get('PORT'));
}

void main();
