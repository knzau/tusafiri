import { Controller, Get, Inject } from '@nestjs/common';

import { Public } from '../auth/public.decorator';
import { HealthService } from './health.service';

@Public()
@Controller()
export class HealthController {
  constructor(@Inject(HealthService) private readonly health: HealthService) {}

  @Get('health')
  live() {
    return this.health.live();
  }

  @Get('ready')
  ready() {
    return this.health.ready();
  }
}
