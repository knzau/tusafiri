import { z } from 'zod';

export const tripSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(200),
});

export type Trip = z.infer<typeof tripSchema>;

export const tripParamsSchema = z.object({
  id: z.uuid(),
});

export type TripParams = z.infer<typeof tripParamsSchema>;
