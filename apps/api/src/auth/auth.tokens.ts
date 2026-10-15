import type { IncomingMessage, ServerResponse } from 'node:http';

export const AUTH = Symbol('AUTH');

export type AuthServer = {
  api: {
    getSession(context: { headers: Headers }): Promise<unknown>;
  };
  handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
};
