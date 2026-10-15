import 'reflect-metadata';

import { createHmac, randomBytes } from 'node:crypto';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { sql } from 'drizzle-orm';
import { sessionCookies } from 'shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../bootstrap';
import { DATABASE } from '../database/database.tokens';
import { session, trips, user, type Database } from '../db/schema';
import { uuidv7 } from '../db/uuid';

const cookieName = sessionCookies.http;

function sessionCookie(token: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (secret === undefined || secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET is required');
  }
  const signature = createHmac('sha256', secret).update(token).digest('base64');
  return `${cookieName}=${encodeURIComponent(`${token}.${signature}`)}`;
}

describe('trip access', () => {
  let app: NestExpressApplication;
  let db: Database;

  beforeAll(async () => {
    app = await createApp();
    db = app.get<Database>(DATABASE);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await db.execute(sql`truncate table "user" cascade`);
  });

  it('keeps the health check public', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: 'ok' } });
  });

  it('rejects a trip read without a session', async () => {
    const response = await request(app.getHttpServer()).get(`/api/v1/trips/${uuidv7()}`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: { code: 'UNAUTHENTICATED' } });
  });

  it('returns the trip to its owner', async () => {
    const ownerId = await insertUser(db, 'owner@example.com');
    const token = await insertSession(db, ownerId);
    const tripId = await insertTrip(db, ownerId, 'Lisbon');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/trips/${tripId}`)
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { id: tripId, name: 'Lisbon' } });
  });

  it('hides another user trip', async () => {
    const ownerId = await insertUser(db, 'owner@example.com');
    const strangerId = await insertUser(db, 'stranger@example.com');
    const token = await insertSession(db, strangerId);
    const tripId = await insertTrip(db, ownerId, 'Lisbon');

    const response = await request(app.getHttpServer())
      .get(`/api/v1/trips/${tripId}`)
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });

  it('rejects an id that is not a uuid', async () => {
    const ownerId = await insertUser(db, 'owner@example.com');
    const token = await insertSession(db, ownerId);

    const response = await request(app.getHttpServer())
      .get('/api/v1/trips/not-a-uuid')
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });

  it('deletes the session on sign-out', async () => {
    const ownerId = await insertUser(db, 'owner@example.com');
    const token = await insertSession(db, ownerId);
    const tripId = await insertTrip(db, ownerId, 'Lisbon');

    const signedOut = await request(app.getHttpServer())
      .post('/api/auth/sign-out')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', sessionCookie(token));

    expect(signedOut.status).toBe(200);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/trips/${tripId}`)
      .set('Cookie', sessionCookie(token));

    expect(response.status).toBe(401);
  });
});

async function insertUser(db: Database, email: string): Promise<string> {
  const id = uuidv7();
  const now = new Date();
  await db.insert(user).values({
    id,
    name: 'Traveler',
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

async function insertSession(db: Database, userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  await db.insert(session).values({
    id: uuidv7(),
    userId,
    token,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  });
  return token;
}

async function insertTrip(db: Database, ownerId: string, name: string): Promise<string> {
  const id = uuidv7();
  await db.insert(trips).values({ id, ownerId, name });
  return id;
}
