import { z } from 'zod';

export const sessionCookies = {
  http: 'better-auth.session_token',
  secure: '__Secure-better-auth.session_token',
} as const;

export const authUserSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.email(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const authSessionSchema = z.object({
  user: authUserSchema,
});

export const socialSignInResponseSchema = z.object({
  url: z.url(),
});
