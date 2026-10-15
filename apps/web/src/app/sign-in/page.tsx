import { Suspense } from 'react';
import type { Metadata } from 'next';

import { SignInScreen } from '@/features/auth';
import { MessagePage } from '@/shared/ui/MessagePage';

export const metadata: Metadata = {
  title: 'Sign in · Tusafiri',
};

export default function SignInPage() {
  return (
    <Suspense fallback={<MessagePage title="Sign in" body="Checking your session." />}>
      <SignInScreen />
    </Suspense>
  );
}
