import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { uuidv7 } from '../uuid';
import { user } from './auth';

export const trips = pgTable(
  'trips',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('trips_owner_id_idx').on(table.ownerId)]
);
