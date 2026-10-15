import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DrizzleReadinessProbe } from './readiness';

@Module({
  controllers: [HealthController],
  providers: [HealthService, DrizzleReadinessProbe],
})
export class HealthModule {}
