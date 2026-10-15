import type { Request } from 'express';

export function headersFrom(request: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    }
  }
  return headers;
}
