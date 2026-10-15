import { env } from '@/shared/config/env';

type AuthRouteContext = {
  params: Promise<{ path: string[] }>;
};

const forwardedHeaders = [
  'cookie',
  'content-type',
  'origin',
  'referer',
  'user-agent',
  'accept',
  'accept-language',
  'x-forwarded-for',
  'x-forwarded-proto',
];

async function proxyAuth(request: Request, context: AuthRouteContext): Promise<Response> {
  const { path } = await context.params;
  const incoming = new URL(request.url);
  const target = new URL(env.API_ORIGIN);
  target.pathname = `/api/auth/${path.map((segment) => encodeURIComponent(segment)).join('/')}`;
  target.search = incoming.search;

  const headers = new Headers();
  for (const name of forwardedHeaders) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === 'GET' || request.method === 'HEAD'
          ? undefined
          : await request.arrayBuffer(),
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return new Response(null, { status: 502 });
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key === 'set-cookie' || key === 'content-encoding' || key === 'content-length') return;
    responseHeaders.append(key, value);
  });
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append('set-cookie', cookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxyAuth;
export const POST = proxyAuth;
