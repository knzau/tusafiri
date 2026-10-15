import type { IncomingMessage, ServerResponse } from 'node:http';

import { authSchema } from '../db/schema/auth';
import type { Database } from '../db/schema';
import { uuidv7 } from '../db/uuid';
import type { AuthServer } from './auth.tokens';

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const DAY_IN_SECONDS = 60 * 60 * 24;

export type AuthEnv = {
  WEB_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

export async function createAuthServer(db: Database, env: AuthEnv): Promise<AuthServer> {
  const [{ betterAuth }, { drizzleAdapter }, { toNodeHandler }] = await Promise.all([
    import('better-auth'),
    import('better-auth/adapters/drizzle'),
    import('better-auth/node'),
  ]);
  const secure = env.WEB_ORIGIN.startsWith('https://');
  const auth = betterAuth({
    baseURL: env.WEB_ORIGIN,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.WEB_ORIGIN],
    telemetry: { enabled: false },
    emailAndPassword: { enabled: false },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        prompt: 'select_account',
      },
    },
    session: {
      expiresIn: WEEK_IN_SECONDS,
      updateAge: DAY_IN_SECONDS,
    },
    account: {
      encryptOAuthTokens: true,
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 30,
      customRules: {
        '/sign-in/social': { window: 60, max: 10 },
      },
    },
    advanced: {
      useSecureCookies: secure,
      database: {
        generateId: () => uuidv7(),
      },
      ipAddress: {
        ipAddressHeaders: ['x-forwarded-for'],
      },
    },
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: authSchema,
      transaction: true,
    }),
  });

  const handle = toNodeHandler(auth);
  return {
    handle: (req: IncomingMessage, res: ServerResponse) => handle(req, res),
    api: {
      getSession: (context) => auth.api.getSession(context),
    },
  };
}
