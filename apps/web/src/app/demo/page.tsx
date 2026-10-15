import type { Metadata } from 'next';

import { MessagePage } from '@/shared/ui/MessagePage';

export const metadata: Metadata = {
  title: 'Demo trip · Tusafiri',
};

export default function DemoPage() {
  return (
    <MessagePage
      title="Demo trip"
      body="The Lisbon demo trip is the next piece. This link is here so the landing actions have somewhere to go."
    />
  );
}
