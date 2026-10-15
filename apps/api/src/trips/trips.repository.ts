import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DATABASE } from '../database/database.tokens';
import { trips, type Database } from '../db/schema';

@Injectable()
export class TripsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findOwned(userId: string, id: string): Promise<{ id: string; name: string } | undefined> {
    const rows = await this.db
      .select({ id: trips.id, name: trips.name })
      .from(trips)
      .where(and(eq(trips.id, id), eq(trips.ownerId, userId)))
      .limit(1);
    return rows[0];
  }
}
