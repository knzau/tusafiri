import type { NextFunction, Request, Response } from 'express';
import type { NestExpressApplication } from '@nestjs/platform-express';

import type { AuthServer } from './auth.tokens';

export function mountAuth(app: NestExpressApplication, auth: AuthServer): void {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const path = req.originalUrl.split('?')[0] ?? '';
    if (path !== '/api/auth' && !path.startsWith('/api/auth/')) {
      next();
      return;
    }
    void auth.handle(req, res).catch(next);
  });
}
