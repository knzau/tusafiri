import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { DATABASE } from '../database/database.tokens';

export interface ReadinessProbe {
  ping(): Promise<void>;
}

@Injectable()
export class DrizzleReadinessProbe implements ReadinessProbe {
  constructor(@Inject(DATABASE) private readonly db: NodePgDatabase) {}

  async ping(): Promise<void> {
    await this.db.execute(sql`select 1`);
  }
}
