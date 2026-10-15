import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { authSchema } from './auth';
import { trips } from './trips';

export const schema = { ...authSchema, trips };

export type Database = NodePgDatabase<typeof schema>;

export { account, session, user, verification } from './auth';
export { trips } from './trips';
