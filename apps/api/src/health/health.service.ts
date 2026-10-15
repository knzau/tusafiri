import { Inject, Injectable } from '@nestjs/common';
import { healthStatusSchema, type HealthStatus } from 'shared';

import { NotReadyError } from '../common/app-error';
import { DrizzleReadinessProbe, type ReadinessProbe } from './readiness';

@Injectable()
export class HealthService {
  constructor(@Inject(DrizzleReadinessProbe) private readonly readiness: ReadinessProbe) {}

  live(): HealthStatus {
    return healthStatusSchema.parse({ status: 'ok' });
  }

  async ready(): Promise<HealthStatus> {
    try {
      await this.readiness.ping();
    } catch {
      throw new NotReadyError();
    }
    return healthStatusSchema.parse({ status: 'ok' });
  }
}
