import { Inject, Injectable } from '@nestjs/common';
import { tripSchema, type Trip } from 'shared';

import { NotFoundError } from '../common/app-error';
import { TripsRepository } from './trips.repository';

@Injectable()
export class TripsService {
  constructor(@Inject(TripsRepository) private readonly trips: TripsRepository) {}

  async get(userId: string, id: string): Promise<Trip> {
    const row = await this.trips.findOwned(userId, id);
    if (!row) throw new NotFoundError();
    return tripSchema.parse(row);
  }
}
