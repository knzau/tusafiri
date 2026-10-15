'use client';

import { Button } from '@mantine/core';
import { useState } from 'react';
import { socialSignInResponseSchema } from 'shared';

import { ROUTES } from '@/shared/config/routes';

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleClick(): Promise<void> {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          callbackURL: ROUTES.trips,
          disableRedirect: true,
        }),
      });
      const body: unknown = await response.json();
      const parsed = socialSignInResponseSchema.safeParse(body);
      if (!response.ok || !parsed.success) {
        setFailed(true);
        setPending(false);
        return;
      }
      window.location.assign(parsed.data.url);
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="filled"
        fullWidth
        loading={pending}
        onClick={() => {
          void handleClick();
        }}
      >
        Continue with Google
      </Button>
      {failed ? (
        <p className="text-sm leading-5 text-muted" role="alert">
          Google didn&apos;t open. Try again.
        </p>
      ) : null}
    </div>
  );
}
