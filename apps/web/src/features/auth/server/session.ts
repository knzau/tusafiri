import 'server-only';

import { cookies } from 'next/headers';
import { authSessionSchema, authUserSchema, type AuthUser } from 'shared';

import { env } from '@/shared/config/env';

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join('; ');
  let response: Response;
  try {
    response = await fetch(new URL('/api/auth/get-session', env.API_ORIGIN), {
      headers: cookie.length > 0 ? { cookie } : {},
      cache: 'no-store',
      signal: AbortSignal.timeout(3_000),
    });
  } catch (error) {
    throw new Error('Session check failed.', { cause: error });
  }
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Session check failed.');
  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error('Session check failed.', { cause: error });
  }
  if (body === null) return null;
  const parsed = authSessionSchema.safeParse(body);
  if (!parsed.success) throw new Error('Session check failed.');
  return authUserSchema.parse(parsed.data.user);
}

export async function getOptionalSession(): Promise<AuthUser | null> {
  try {
    return await getSession();
  } catch {
    return null;
  }
}
