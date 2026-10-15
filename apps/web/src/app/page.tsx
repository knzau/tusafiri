import { Suspense } from 'react';

import { getOptionalSession } from '@/features/auth';
import { LandingPage } from '@/features/landing';

async function LandingWithSession() {
  const session = await getOptionalSession();
  return <LandingPage signedIn={session !== null} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<LandingPage />}>
      <LandingWithSession />
    </Suspense>
  );
}
