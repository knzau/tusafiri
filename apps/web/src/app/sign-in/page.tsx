import type { Metadata } from 'next';

import { MessagePage } from '@/shared/ui/MessagePage';

export const metadata: Metadata = {
  title: 'Sign in · Tusafiri',
};

export default function SignInPage() {
  return (
    <MessagePage
      title="Sign in"
      body="Google sign-in is the next phase. The button on the landing page already points here."
    />
  );
}
