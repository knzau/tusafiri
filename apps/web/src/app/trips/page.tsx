import { Suspense } from 'react';
import type { Metadata } from 'next';

import { TripsPage } from '@/features/trips';
import { MessagePage } from '@/shared/ui/MessagePage';

export const metadata: Metadata = {
  title: 'Your trips · Tusafiri',
};

export default function TripsRoute() {
  return (
    <Suspense fallback={<MessagePage title="Your trips" body="Checking your session." />}>
      <TripsPage />
    </Suspense>
  );
}
