export function readRequestId(req: object): string {
  if ('id' in req && typeof req.id === 'string' && req.id.length > 0) {
    return req.id;
  }
  return 'unknown';
}
