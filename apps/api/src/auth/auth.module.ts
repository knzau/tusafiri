import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import type { Env } from '../config/env';
import { DATABASE } from '../database/database.tokens';
import type { Database } from '../db/schema';
import { createAuthServer } from './auth.server';
import { AUTH, type AuthServer } from './auth.tokens';
import { SessionGuard } from './session.guard';

@Module({
  providers: [
    {
      provide: AUTH,
      inject: [DATABASE, ConfigService],
      useFactory: (db: Database, config: ConfigService<Env, true>): Promise<AuthServer> =>
        createAuthServer(db, {
          WEB_ORIGIN: config.get('WEB_ORIGIN'),
          BETTER_AUTH_SECRET: config.get('BETTER_AUTH_SECRET'),
          GOOGLE_CLIENT_ID: config.get('GOOGLE_CLIENT_ID'),
          GOOGLE_CLIENT_SECRET: config.get('GOOGLE_CLIENT_SECRET'),
        }),
    },
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
  exports: [AUTH],
})
export class AuthModule {}
