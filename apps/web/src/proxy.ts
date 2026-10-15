import { NextResponse, type NextRequest } from 'next/server';
import { sessionCookies } from 'shared';

import { ROUTES } from '@/shared/config/routes';

export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(sessionCookies.http) || request.cookies.has(sessionCookies.secure);
  if (!hasSession) {
    return NextResponse.redirect(new URL(ROUTES.signIn, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/trips', '/trips/:path*'],
};
