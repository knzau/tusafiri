'use client';

type ErrorPageProps = {
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-12 text-ink">
      <div className="flex max-w-md flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-lg leading-7 text-muted">The page could not be shown.</p>
        <button
          type="button"
          className="w-fit text-sm font-medium text-link"
          onClick={() => {
            reset();
          }}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
