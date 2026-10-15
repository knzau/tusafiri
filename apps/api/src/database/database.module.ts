import { Global, Inject, Injectable, Module, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { Env } from '../config/env';
import { schema, type Database } from '../db/schema';
import { DATABASE, POOL } from './database.tokens';

@Injectable()
class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(@Inject(POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new Pool({
          connectionString: config.get('DATABASE_URL'),
          max: 10,
          statement_timeout: 10_000,
        }),
    },
    {
      provide: DATABASE,
      inject: [POOL],
      useFactory: (pool: Pool): Database => drizzle({ client: pool, schema }),
    },
    DatabaseLifecycle,
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
