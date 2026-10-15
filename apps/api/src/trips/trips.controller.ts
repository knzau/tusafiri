import { Controller, Get, Inject, Param } from '@nestjs/common';
import { tripParamsSchema, type AuthUser, type Trip, type TripParams } from 'shared';

import { ZodPipe } from '../common/zod.pipe';
import { CurrentUser } from '../auth/current-user';
import { TripsService } from './trips.service';

@Controller({ path: 'trips', version: '1' })
export class TripsController {
  constructor(@Inject(TripsService) private readonly trips: TripsService) {}

  @Get(':id')
  get(
    @CurrentUser() user: AuthUser,
    @Param(new ZodPipe(tripParamsSchema)) params: TripParams,
  ): Promise<Trip> {
    return this.trips.get(user.id, params.id);
  }
}
