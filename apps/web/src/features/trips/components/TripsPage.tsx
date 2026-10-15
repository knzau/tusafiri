import { redirect } from 'next/navigation';

import { getSession, SignOutButton } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';

export async function TripsPage() {
  const session = await getSession();
  if (!session) redirect(ROUTES.signIn);

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-12 text-ink">
      <div className="flex w-full max-w-md flex-col gap-4">
        <h1 className="text-[2rem] leading-[1.1] font-bold tracking-[-0.03em]">Your trips</h1>
        <p className="text-lg leading-7 text-muted">Signed in as {session.name}.</p>
        <p className="text-lg leading-7">No trips yet.</p>
        <SignOutButton />
      </div>
    </main>
  );
}
