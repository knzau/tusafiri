'use client';

import { Button, type ButtonProps } from '@mantine/core';
import Link from 'next/link';

type LandingLinkButtonProps = ButtonProps & {
  href: string;
};

export function LandingLinkButton({ href, ...rest }: LandingLinkButtonProps) {
  return <Button component={Link} href={href} {...rest} />;
}
