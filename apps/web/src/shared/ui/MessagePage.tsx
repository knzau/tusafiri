import Link from 'next/link';

import { ROUTES } from '@/shared/config/routes';

type MessagePageProps = {
  title: string;
  body: string;
};

export function MessagePage({ title, body }: MessagePageProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-12 text-ink">
      <div className="flex max-w-md flex-col gap-4">
        <h1 className="text-[2rem] leading-[1.1] font-bold tracking-[-0.03em]">{title}</h1>
        <p className="text-lg leading-7 text-muted">{body}</p>
        <Link className="text-sm leading-5 font-medium text-link" href={ROUTES.home}>
          Back to Tusafiri
        </Link>
      </div>
    </main>
  );
}
