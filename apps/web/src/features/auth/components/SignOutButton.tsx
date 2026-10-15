'use client';

import { Button } from '@mantine/core';
import { useState } from 'react';

import { ROUTES } from '@/shared/config/routes';

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleClick(): Promise<void> {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch('/api/auth/sign-out', { method: 'POST' });
      if (!response.ok) {
        setFailed(true);
        setPending(false);
        return;
      }
      window.location.assign(ROUTES.home);
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="default"
        loading={pending}
        onClick={() => {
          void handleClick();
        }}
      >
        Sign out
      </Button>
      {failed ? (
        <p className="text-sm leading-5 text-muted" role="alert">
          Sign out didn&apos;t finish. Try again.
        </p>
      ) : null}
    </div>
  );
}
