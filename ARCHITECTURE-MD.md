# TripBoard MVP - Master Architecture & Deployment Guide

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Design & Security](#4-database-design--security)
5. [API & BFF Design](#5-api--bff-design)
6. [Security & Threat Model](#6-security--threat-model)
7. [Deployment Strategy (Prod + Staging)](#7-deployment-strategy-prod--staging)
8. [Development Workflow](#8-development-workflow)

---

## 1. Project Overview

**TripBoard** is a lean, collaborative, map-based trip planning application. Users can collect points of interest (POIs) on a map, organize them into day-by-day itineraries, estimate budgets, and securely share plans with travel companions.

### Core MVP Features
- **Map-First Planning:** Visualize and add POIs using Mapbox.
- **Itinerary Builder:** Drag-and-drop POIs into day-by-day timelines.
- **Lightweight Budgeting:** Estimate costs per item and track total trip budget.
- **Secure Collaboration:** Invite friends via secure, expiring hashed links.
- **AI Assistant:** Organize saved places into logical daily routes using Google Gemini.
- **Public Sharing:** Generate read-only, expiring links for external viewing.

---

## 2. Technology Stack

### Frontend & BFF (Backend-for-Frontend)
- **Framework:** Next.js 14+ (App Router, React Server Components)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms & Validation:** React Hook Form + Zod
- **State Management:** Zustand (UI state), Next.js Server Actions (Server state)
- **Maps:** Mapbox GL JS (Client-side rendering)

### Backend & Infrastructure
- **Database:** PostgreSQL 16 (with Row Level Security)
- **ORM:** Prisma
- **Authentication:** Better Auth (Google OAuth, HTTP-Only Cookies)
- **AI:** Google Gemini API (Server-side Proxy)
- **Geocoding:** Mapbox Geocoding API (Server-side Proxy)
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx + Certbot (Let's Encrypt)
- **Hosting:** Hostinger VPS

---

## 3. System Architecture

### The BFF (Backend-for-Frontend) Pattern
The browser never communicates directly with the database, Gemini API, or privileged Mapbox APIs. Next.js acts as the BFF, handling all external requests, secret management, and data sanitization.

```text
[ Browser / PWA ] 
       │ HTTPS (HTTP-Only Cookies)
       ▼
[ Nginx Reverse Proxy ] (SSL Termination, Rate Limiting)
       │
       ▼
[ Next.js App Container ]
       ├──► [ Prisma ORM ] ───────► [ PostgreSQL Container (RLS Enabled) ]
       ├──► [ Mapbox Proxy ] ─────► [ Mapbox API ] (Cached, Rate Limited)
       └──► [ Gemini Proxy ] ─────► [ Gemini API ] (PII Stripped)
```

### Repository Structure
```text
tripboard/
├── docs/                  # Master Architecture (this file)
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router (Pages & API Routes)
│   │   ├── (auth)/        # Login/Register pages
│   │   ├── (dashboard)/   # Protected app routes
│   │   ├── api/           # BFF API Routes (Mapbox, Webhooks)
│   │   ├── share/         # Public read-only share routes
│   │   └── layout.tsx
│   ├── components/        # React components (ui, map, itinerary)
│   ├── lib/               # Utilities, Zod schemas, constants
│   ├── server/            # Server-only code (DB, Auth, Services)
│   │   ├── auth.ts        # Better Auth config
│   │   ├── db.ts          # Prisma client
│   │   ├── actions/       # Server Actions (Mutations)
│   │   └── services/      # Mapbox & Gemini proxy logic
│   └── stores/            # Zustand client stores (UI state)
├── docker-compose.yml     # Parameterized for Prod & Staging
├── nginx/                 # Nginx configuration files
└── Dockerfile             # Production Next.js build
```

---

## 4. Database Design & Security

### Design Principles
1. **UUIDs:** All primary keys are UUIDs to prevent enumeration attacks (IDOR).
2. **Row Level Security (RLS):** Postgres RLS is enabled on all core tables.
3. **Audit Trails:** `created_at` and `updated_at` on all entities.
4. **Hashed Tokens:** Invite and Share link tokens are stored as SHA-256 hashes.

### Prisma Schema (Core Entities)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(dbgenerated("gen_random_uuid()"))
  name          String?
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tripsOwned    Trip[]   @relation("TripOwner")
  memberships   TripMember[]
  
  @@map("users")
}

model Trip {
  id              String   @id @default(dbgenerated("gen_random_uuid()"))
  ownerId         String
  name            String
  destination     String?
  startDate       DateTime?
  endDate         DateTime?
  budgetTotal     Decimal? @db.Decimal(10, 2)
  currency        String   @default("USD")
  interests       String[] 
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  owner           User     @relation("TripOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members         TripMember[]
  items           TripItem[]
  invites         TripInvite[]
  shareLinks      ShareLink[]

  @@index([ownerId])
  @@map("trips")
}

model TripMember {
  tripId    String
  userId    String
  role      String   @default("editor") 
  joinedAt  DateTime @default(now())

  trip      Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([tripId, userId])
  @@map("trip_members")
}

model TripItem {
  id             String   @id @default(dbgenerated("gen_random_uuid()"))
  tripId         String
  type           String   // 'place', 'stay', 'transport', 'note'
  title          String
  category       String?
  latitude       Float?
  longitude      Float?
  estimatedCost  Decimal? @db.Decimal(10, 2)
  dayDate        DateTime?
  sortOrder      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  trip           Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([tripId, dayDate])
  @@map("trip_items")
}

model TripInvite {
  id          String    @id @default(dbgenerated("gen_random_uuid()"))
  tripId      String
  tokenHash   String    @unique
  role        String    @default("editor")
  expiresAt   DateTime
  acceptedAt  DateTime?
  createdAt   DateTime  @default(now())

  trip        Trip      @relation(fields: [tripId], references: [id], onDelete: Cascade)
  @@map("trip_invites")
}
```

### Row Level Security (RLS) Policies
*Applied via raw SQL migrations.*

```sql
-- 1. Helper to check if current user is in the trip_members table
CREATE OR REPLACE FUNCTION is_trip_member(tid uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_members 
    WHERE trip_id = tid AND user_id = current_setting('app.current_user_id', true)::uuid
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

-- 3. Apply Policies
CREATE POLICY trip_select ON trips FOR SELECT USING (
  owner_id = current_setting('app.current_user_id', true)::uuid OR is_trip_member(id)
);

CREATE POLICY item_select ON trip_items FOR SELECT USING (
  is_trip_member(trip_id)
);

CREATE POLICY item_insert ON trip_items FOR INSERT WITH CHECK (
  is_trip_member(trip_id)
);
```

---

## 5. API & BFF Design

### Server Actions (Mutations)
All state-changing operations use Next.js Server Actions.
```typescript
// src/server/actions/trips.ts
export async function createTrip(data: z.infer<typeof createTripSchema>) { ... }
export async function addTripItem(tripId: string, data: z.infer<typeof addItemSchema>) { ... }
```

### BFF Proxy Endpoints (Route Handlers)

#### Mapbox Geocoding Proxy
Protects the server token and implements caching.
```typescript
// src/app/api/maps/search/route.ts
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { q } = querySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  
  const cached = await geocodeCache.get(q);
  if (cached) return Response.json(cached);

  const result = await fetchMapboxGeocode(q); // Uses MAPBOX_SERVER_TOKEN
  await geocodeCache.set(q, result);
  return Response.json(result);
}
```

#### Gemini AI Proxy
Strips PII and enforces strict JSON output.
```typescript
// src/app/api/ai/organize/route.ts
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { tripId } = await req.json();
  const tripData = await getSanitizedTripData(tripId); // Strips emails, exact user IDs
  
  const aiResponse = await callGemini(tripData);
  return Response.json(aiResponse);
}
```

### Zod Validation Schemas
```typescript
export const addItemSchema = z.object({
  title: z.string().min(1).max(150),
  type: z.enum(["place", "stay", "transport", "note"]),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  estimatedCost: z.number().min(0).max(100000).optional(),
  dayDate: z.string().date().optional(), 
});
```

---

## 6. Security & Threat Model

1. **Authentication:** Better Auth using HTTP-Only, Secure, SameSite=Lax cookies. No JWTs in LocalStorage.
2. **IDOR Prevention:** BFF extracts `userId` from the secure cookie, sets Postgres session variable, and relies on RLS. Client payloads are never trusted for authorization.
3. **Secure Sharing:** Invite/Share tokens are cryptographically random. Only the SHA-256 hash is stored in the DB.
4. **Data Leakage (AI):** The BFF explicitly whitelists fields sent to Gemini. PII is stripped.
5. **Frontend Security:** React escapes output by default. `dangerouslySetInnerHTML` is forbidden.
6. **VPS Hardening:** SSH keys only. UFW firewall (80, 443, 22). Postgres port (5432) is strictly internal to the Docker network.

---

## 7. Deployment Strategy (Prod + Staging)

We use a single Hostinger VPS but isolate the environments using Docker Compose project names, parameterized environment files, and separate database volumes.

### 1. Parameterized `docker-compose.yml`
```yaml
version: '3.8'

services:
  app:
    build: .
    restart: unless-stopped
    env_file: .env
    environment:
      - PORT=${APP_PORT:-3000}
      - DATABASE_URL=postgresql://tripboard:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
    depends_on:
      - db
    networks:
      - internal
    ports:
      - "${APP_PORT:-3000}:${APP_PORT:-3000}"

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: tripboard
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - ${DB_VOLUME_NAME:-pgdata_default}:/var/lib/postgresql/data
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

### 2. Environment Files
**`.env.prod`**
```env
APP_PORT=3000
POSTGRES_DB=tripboard_prod
DB_VOLUME_NAME=pgdata_prod
POSTGRES_PASSWORD=<super_secret_prod_password>
BETTER_AUTH_SECRET=<prod_secret>
NEXT_PUBLIC_APP_URL=https://tripboard.com
```

**`.env.stage`**
```env
APP_PORT=3001
POSTGRES_DB=tripboard_stage
DB_VOLUME_NAME=pgdata_stage
POSTGRES_PASSWORD=<super_secret_stage_password>
BETTER_AUTH_SECRET=<stage_secret>
NEXT_PUBLIC_APP_URL=https://stage.tripboard.com
```

### 3. Deployment Commands
```bash
# Deploy Production
docker compose --env-file .env.prod -p tripboard-prod up -d --build

# Deploy Staging
docker compose --env-file .env.stage -p tripboard-stage up -d --build
```

### 4. Nginx Configuration
**Production (`/etc/nginx/sites-available/tripboard.com`)**
```nginx
server {
    listen 443 ssl http2;
    server_name tripboard.com www.tripboard.com;

    ssl_certificate /etc/letsencrypt/live/tripboard.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tripboard.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Staging (`/etc/nginx/sites-available/stage.tripboard.com`)**
```nginx
server {
    listen 443 ssl http2;
    server_name stage.tripboard.com;

    ssl_certificate /etc/letsencrypt/live/stage.tripboard.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stage.tripboard.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 8. Development Workflow

### Git Workflow
- `main`: Production ready.
- `staging`: Auto-deploys to `stage.tripboard.com`.
- `feature/*`: Local development and PRs.

### Local Development Setup
```bash
# Start local DB
docker compose up -d db

# Push Prisma Schema
pnpm prisma db push

# Run Next.js
pnpm dev
```

### Pre-Deployment Checklist
- [ ] Zod schemas validate all external inputs.
- [ ] RLS policies applied to new tables.
- [ ] No secrets committed to Git.
- [ ] Nginx SSL certificates verified.
- [ ] Database backups tested.