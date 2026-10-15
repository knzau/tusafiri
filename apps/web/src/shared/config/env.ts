import 'server-only';

import { z } from 'zod';

const schema = z.object({
  API_ORIGIN: z.url().refine((origin) => !origin.endsWith('/'), 'no trailing slash'),
});

export const env = schema.parse({
  API_ORIGIN: process.env.API_ORIGIN ?? 'http://localhost:3001',
});
