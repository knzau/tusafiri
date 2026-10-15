import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';

import { getSession } from '../server/session';
import { GoogleSignInButton } from './GoogleSignInButton';

export async function SignInScreen() {
  const session = await getSession();
  if (session) redirect(ROUTES.trips);

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-12 text-ink">
      <div className="flex w-full max-w-md flex-col gap-4">
        <h1 className="text-[2rem] leading-[1.1] font-bold tracking-[-0.03em]">Sign in</h1>
        <p className="text-lg leading-7 text-muted">
          Use your Google account. Tusafiri keeps the session in a cookie and never asks for a
          password.
        </p>
        <GoogleSignInButton />
        <Link className="text-sm leading-5 font-medium text-link" href={ROUTES.home}>
          Back to Tusafiri
        </Link>
      </div>
    </main>
  );
}
