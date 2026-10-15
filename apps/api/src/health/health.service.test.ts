import { describe, expect, it } from 'vitest';

import { NotReadyError } from '../common/app-error';
import { HealthService } from './health.service';
import type { ReadinessProbe } from './readiness';

function probe(ping: () => Promise<void>): ReadinessProbe {
  return { ping };
}

describe('HealthService', () => {
  it('reports live without touching the database', () => {
    const service = new HealthService(probe(() => Promise.reject(new Error('down'))));

    expect(service.live()).toEqual({ status: 'ok' });
  });

  it('reports ready when the database answers', async () => {
    const service = new HealthService(probe(() => Promise.resolve()));

    await expect(service.ready()).resolves.toEqual({ status: 'ok' });
  });

  it('reports not ready when the database is down', async () => {
    const service = new HealthService(probe(() => Promise.reject(new Error('connection refused'))));

    await expect(service.ready()).rejects.toBeInstanceOf(NotReadyError);
  });
});
