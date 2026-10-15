# Trip Planning MVP — Current Plan

## 1. Product Goal

Build a **lean, creative, solo-dev maintainable trip planning MVP** that can be used and tested with real trips and real people.

This is **not a market launch product yet**.

The goal is to validate the core planning experience:

> Users can plan a trip visually on a map, add places, organize them into days, estimate costs, invite participants, and get lightweight AI assistance.

---

## 2. MVP Concept

### Working name

**TripBoard**

### One-line description

A shared trip board where travelers collect places on a map, organize them into a day-by-day itinerary, estimate costs, and share the plan with participants.

### Core loop

```text
Create trip
  ↓
Add places / POIs
  ↓
See places on map
  ↓
Assign places to days
  ↓
Estimate budget
  ↓
Invite / share with participants
  ↓
Use AI to organize or improve the plan
```

---

## 3. MVP Principles

### Keep it lean

Build only what is needed to plan a real trip.

### Keep it useful

The app must be useful even without AI.

### Keep it secure

Trip data must only be accessible to the correct user and invited participants.

### Keep it maintainable

Use a simple stack that one developer can manage.

### Keep it testable

The app should be usable for real trips with friends as soon as possible.

---

## 4. MVP Scope

## Included

- User authentication
- Trip creation
- Trip details:
  - name
  - destination
  - start/end date
  - number of travelers
  - currency
  - budget
  - interests
  - notes
- Add places / points of interest
- Map view with pins
- Map search
- Assign places to days
- Simple day-by-day itinerary
- Drag-and-drop reordering
- Estimated cost per item
- Total trip budget
- Estimated cost per person
- Invite participants
- Public read-only share link
- AI suggestion feature:
  - organize saved places into days
  - suggest missing ideas
- Responsive web app
- Staging environment
- Production environment

## Excluded for now

- Native mobile app
- Booking integrations
- Flight search
- Hotel booking
- Expense splitting
- Receipts
- Real-time collaboration
- Offline mode
- Social network features
- Public community itineraries
- Payments
- Advanced permissions
- Directions / routing
- Calendar sync
- Email import
- Instagram/TikTok import

---

## 5. Technology Stack

### Frontend / BFF

- **Next.js** with App Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Zod**
- **React Hook Form**
- **dnd-kit** for drag-and-drop
- **Mapbox GL JS** for map rendering

### Backend

- Next.js API routes / Server Actions as the **BFF**
- **Node.js**
- **TypeScript**
- **Prisma**
- **PostgreSQL**
- **Better Auth**

### Third-party services

- **Mapbox**
  - map rendering
  - place search / geocoding
- **Google Gemini**
  - AI itinerary suggestions

### Infrastructure

- **Hostinger VPS**
- **Docker**
- **Docker Compose**
- **Nginx**
- **Certbot / Let's Encrypt**

---

## 6. Architecture Decision: BFF

Use a **Backend-for-Frontend** pattern.

The browser does not directly access:

- the database
- Gemini API
- privileged Mapbox APIs
- secret keys

Instead:

```text
Browser
  ↓ HTTPS
Nginx
  ↓
Next.js BFF
  ↓
Postgres / Mapbox / Gemini
```

### Why BFF?

- Protects secrets
- Enforces authentication
- Enforces authorization
- Allows rate limiting
- Allows input validation
- Allows caching
- Allows AI payload sanitization
- Gives one central security boundary

---

## 7. Authentication Plan

### Primary recommendation

Use **Better Auth**.

Reasons:

- self-hosted
- fits Next.js
- keeps user data on your own infrastructure
- works well with BFF session-cookie pattern
- flexible for future OAuth, magic links, email/password

### Login method for MVP

Start with:

- **Google OAuth**

Why:

- simple for testers
- avoids password reset flows
- reduces password-related security risk

Can add later:

- email/password
- magic links
- Apple login

### Session rules

- HTTP-only cookies
- Secure cookies in production
- SameSite=Lax or Strict
- Session validated server-side
- Never trust client-provided user ID

---

## 8. Security Plan

### Core rule

A user can access a trip only if:

1. they own the trip, or
2. they are an invited member of the trip.

Everything else is denied.

---

## 9. Authorization Model

### Roles

For MVP:

- **owner**
  - full control
  - can delete trip
  - can manage members
  - can create invite/share links
- **editor**
  - can view and edit trip items
  - can add places
  - can assign places to days
  - can edit notes and costs
- **public share viewer**
  - read-only
  - no login required
  - cannot see private member data

---

## 10. Database Plan

Use PostgreSQL with UUID primary keys.

### Core tables

#### users

Handled by Better Auth.

Basic fields:

```text
users
- id
- name
- email
- email_verified
- image
- created_at
- updated_at
```

#### trips

```text
trips
- id
- owner_id
- name
- destination
- start_date
- end_date
- travelers_count
- currency
- budget_total
- interests
- mood_tags
- notes
- cover_emoji
- cover_color
- created_at
- updated_at
```

#### trip_members

```text
trip_members
- trip_id
- user_id
- role
- joined_at
```

Primary key:

```text
(trip_id, user_id)
```

#### trip_items

```text
trip_items
- id
- trip_id
- type
- title
- category
- address
- latitude
- longitude
- estimated_cost
- notes
- status
- day_date
- sort_order
- start_time
- created_at
- updated_at
```

`type` values:

```text
place
stay
transport
note
```

`status` values:

```text
idea
planned
done
```

#### trip_invites

```text
trip_invites
- id
- trip_id
- token_hash
- role
- expires_at
- accepted_at
- created_at
```

#### trip_share_links

```text
trip_share_links
- id
- trip_id
- token_hash
- expires_at
- revoked_at
- created_at
```

#### geocode_cache

```text
geocode_cache
- id
- query_hash
- query
- result_json
- created_at
```

---

## 11. Database Security

### Use Postgres Row Level Security

RLS should be enabled on:

```text
trips
trip_members
trip_items
```

### Goal

Even if the application layer has a bug, Postgres should still prevent unauthorized access.

### Example policy concept

A user can select a trip if:

```text
they are the owner
or
they are a member of the trip
```

A user can insert/update/delete trip items only if:

```text
they are a member of the item's trip
```

### Additional constraints

- UUID primary keys
- foreign key constraints
- check constraints for latitude/longitude
- check constraints for cost >= 0
- prevent changing `trip_id` on item update
- unique hashed invite/share tokens
- expiry timestamps for invites/share links

---

## 12. API Plan

All protected endpoints must:

1. validate the session
2. validate the user
3. validate the trip membership
4. validate the input with Zod
5. return only safe data

---

## 13. Core API / Server Actions

### Trips

```text
createTrip
getTrip
updateTrip
deleteTrip
listMyTrips
```

### Trip items

```text
addTripItem
updateTripItem
deleteTripItem
reorderTripItems
assignItemToDay
```

### Members

```text
listTripMembers
removeTripMember
```

### Invites

```text
createInvite
acceptInvite
revokeInvite
```

### Share links

```text
createShareLink
revokeShareLink
getPublicSharedTrip
```

### Map search

```text
GET /api/maps/search?q=london
```

This endpoint:

- requires authentication
- validates query
- rate limits requests
- checks cache
- calls Mapbox using server token
- stores cached result
- returns minimal safe data

### AI suggestions

```text
POST /api/ai/suggest
```

This endpoint:

- requires authentication
- checks trip membership
- loads trip data
- strips personal data
- calls Gemini
- validates AI output
- returns structured suggestions

---

## 14. Mapbox Plan

### Usage

Use Mapbox for:

- map rendering
- displaying pins
- searching places

### Tokens

Use two tokens:

```text
NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN
MAPBOX_SERVER_TOKEN
```

### Public token

Used by browser for map rendering.

Must be:

- restricted to app domain
- limited to required map APIs
- safe to expose

### Server token

Used only by BFF.

Used for:

- geocoding/search
- caching
- rate limiting

### Free-tier protection

To stay within free tier:

- debounce search input
- require minimum characters
- limit result count
- cache repeated searches
- avoid Directions API
- avoid Matrix API
- set budget alerts in Mapbox dashboard

---

## 15. Gemini AI Plan

### Use case

AI is optional and assistive.

It should not be required for basic planning.

### MVP AI features

#### 1. Organize saved places

Safest feature.

Input:

- trip dates
- interests
- budget
- already saved places

Output:

- suggested day grouping
- suggested order
- reasoning

#### 2. Suggest missing ideas

Inspiration only.

Examples:

- add a dinner spot
- add a viewpoint
- add a museum
- add a cafe

These suggestions should not be blindly inserted.

User should review and add them manually or confirm them.

---

## 16. AI Security Rules

Do not send unnecessary personal data to Gemini.

### Safe to send

- destination
- trip length
- budget
- currency
- interests
- mood tags
- place titles
- place categories
- estimated costs

### Do not send

- user emails
- user IDs
- member emails
- invite tokens
- share tokens
- private notes unless explicitly needed
- session cookies
- API keys

### AI output rules

- require structured JSON
- validate with Zod
- do not trust place existence
- do not automatically write to database
- show suggestion cards
- user confirms before applying

---

## 17. Frontend Plan

### Main screens

#### 1. Home / Dashboard

Shows:

- user's trips
- create trip button

#### 2. Trip workspace

Main planning screen.

Contains:

- trip title
- dates
- budget
- map
- saved places
- day itinerary
- item details drawer

#### 3. Trip settings

Edit:

- trip name
- destination
- dates
- travelers
- budget
- currency
- interests
- notes
- cover emoji/color

#### 4. Sharing screen

Manage:

- invite links
- members
- public share link

#### 5. Public share page

Read-only trip view.

Shows:

- trip summary
- map
- day plan
- estimated budget

Does not show:

- member emails
- invite links
- admin controls
- private account data

---

## 18. Mobile Plan

Do not build a native mobile app yet.

Use:

- responsive web design
- mobile-friendly layout
- PWA-like behavior if useful

Main mobile tabs:

```text
Map
Itinerary
Places
Trip settings
```

---

## 19. Environment Plan

Use two environments:

```text
Staging
Production
```

Both can run on the same Hostinger VPS using Docker.

They must be isolated.

---

## 20. Staging Environment

### Purpose

Test:

- new features
- database migrations
- deployment changes
- AI prompts
- map changes
- auth changes

### URL

Example:

```text
https://stage.yourdomain.com
```

### Isolation

Staging must have:

- separate database
- separate database volume
- separate environment variables
- separate app port
- separate secrets
- separate Mapbox/Gemini usage if possible

---

## 21. Production Environment

### Purpose

Used for real trips with real people.

### URL

Example:

```text
https://yourdomain.com
```

### Rules

- HTTPS only
- secure cookies
- strict environment variables
- backups enabled
- error logging enabled
- rate limiting enabled

---

## 22. Environment Separation

Use parameterized Docker Compose.

### Production

```text
APP_PORT=3000
POSTGRES_DB=tripboard_prod
DB_VOLUME_NAME=pgdata_prod
```

### Staging

```text
APP_PORT=3001
POSTGRES_DB=tripboard_stage
DB_VOLUME_NAME=pgdata_stage
```

### Nginx routing

```text
yourdomain.com        -> 127.0.0.1:3000
stage.yourdomain.com  -> 127.0.0.1:3001
```

---

## 23. Deployment Plan

### Hosting

Hostinger VPS.

### Containers

```text
app   = Next.js
db    = PostgreSQL
nginx = reverse proxy
```

### Docker principles

- Postgres not exposed publicly
- app and DB on internal Docker network
- Nginx exposed on ports 80/443
- environment variables not committed
- strong Postgres passwords
- production and staging separated by compose project names

### Suggested commands

Production:

```bash
docker compose --env-file .env.prod -p tripboard-prod up -d --build
```

Staging:

```bash
docker compose --env-file .env.stage -p tripboard-stage up -d --build
```

---

## 24. Nginx Plan

Use Nginx as reverse proxy.

Responsibilities:

- SSL termination
- proxy to Next.js
- security headers
- basic rate limiting if needed
- routing staging and production domains

### SSL

Use:

```text
Certbot + Let's Encrypt
```

### Required domains

```text
yourdomain.com
stage.yourdomain.com
```

### Required Nginx behavior

```text
HTTP -> HTTPS redirect
proxy to app
secure headers
proper proxy headers
```

---

## 25. VPS Security Checklist

- SSH keys only
- disable root login
- disable password login
- UFW firewall enabled
- allow only:
  - 22
  - 80
  - 443
- Docker Postgres port not exposed publicly
- automatic security updates enabled
- regular database backups
- secrets stored in `.env` files
- `.env` files not committed to Git

---

## 26. Backup Plan

At minimum:

- daily Postgres dump
- compress dump
- store for at least 7 days
- test restore process

Example target:

```text
/backups/tripboard-prod-YYYY-MM-DD.sql.gz
/backups/tripboard-stage-YYYY-MM-DD.sql.gz
```

Later:

- upload backups to off-server storage

---

## 27. Testing Plan

### Test with real trips

Use the app for:

1. one solo trip
2. one trip with one friend
3. one group trip with 3+ people

### Observe

- Is trip creation fast?
- Is adding places annoying?
- Does the map help?
- Do users assign days?
- Do users understand budget?
- Do invite links work?
- Does the public share page work?
- Are AI suggestions useful?

---

## 28. Security Test Checklist

Before real usage, test:

### Authentication

- unauthenticated users cannot access dashboard
- unauthenticated users cannot call protected APIs
- logout works
- session cookie is HTTP-only

### Trip access

- user A cannot view user B's trip
- user A cannot edit user B's trip
- user A cannot delete user B's trip
- non-member cannot access trip by direct URL

### Item access

- user cannot edit item from another trip
- user cannot delete item from another trip
- user cannot move item to another trip

### Invites

- invite link expires
- invite link cannot be reused after acceptance
- revoked invite stops working

### Public share

- public share link is read-only
- public share link does not expose emails
- revoked share link stops working

### API

- invalid input rejected
- unexpected fields rejected
- rate limiting works
- errors do not leak secrets or stack traces

---

## 29. Build Roadmap

## Phase 1: Foundation

Goal:

> Basic app runs locally and on VPS.

Tasks:

- create Next.js app
- setup TypeScript
- setup Tailwind
- setup shadcn/ui
- setup Docker
- setup Postgres
- setup Prisma
- setup Nginx
- setup staging/prod domains

## Phase 2: Authentication

Goal:

> Users can log in securely.

Tasks:

- setup Better Auth
- setup Google OAuth
- protect dashboard
- create user session handling
- create logout

## Phase 3: Trip CRUD

Goal:

> Users can create and manage trips.

Tasks:

- create trip
- list trips
- view trip
- edit trip
- delete trip
- trip settings form

## Phase 4: Places + Map

Goal:

> Users can add places and see them on a map.

Tasks:

- integrate Mapbox map
- create map search endpoint
- add place to trip
- edit place
- delete place
- show pins
- map pin details

## Phase 5: Itinerary

Goal:

> Users can organize places into days.

Tasks:

- generate days from trip dates
- assign item to day
- reorder items
- drag-and-drop
- item status
- simple timeline UI

## Phase 6: Budget

Goal:

> Users can see rough trip cost.

Tasks:

- estimated cost per item
- total cost
- cost per person
- budget target
- under/over budget indicator

## Phase 7: Sharing

Goal:

> Users can plan with real people.

Tasks:

- invite links
- accept invite
- trip members list
- remove member
- public share link
- read-only share page

## Phase 8: AI

Goal:

> AI helps organize the trip.

Tasks:

- create AI suggestion endpoint
- sanitize trip data
- call Gemini
- validate JSON
- show suggestion cards
- apply suggestions manually

## Phase 9: Security pass

Goal:

> Make it safe for real usage.

Tasks:

- RLS checks
- Zod validation
- rate limiting
- error handling
- security headers
- backup script
- security test checklist

## Phase 10: Real trip dogfooding

Goal:

> Use it for an actual trip.

Tasks:

- create real trip
- invite real people
- observe friction
- collect feedback
- fix critical issues

---

## 30. Definition of MVP Success

The MVP is successful if:

- you can plan a real trip with it
- friends can join easily
- the map makes planning clearer
- the itinerary is easy to understand
- the budget estimate is useful
- sharing works without confusion
- you want to use it again for the next trip

---

## 31. Main Risks

### Scope creep

Risk:

- building too many features too early

Solution:

- focus on core planning loop

### Map API costs

Risk:

- too many geocoding requests

Solution:

- caching
- rate limiting
- budget alerts

### AI hallucinations

Risk:

- AI suggests places that do not exist

Solution:

- AI organizes saved places first
- suggestions require user confirmation

### Authorization bugs

Risk:

- users accessing trips they should not see

Solution:

- session-based auth
- server-side membership checks
- Postgres RLS
- security testing

### Deployment complexity

Risk:

- staging/prod setup becomes difficult

Solution:

- Docker Compose
- separate env files
- separate DB volumes
- Nginx routing

---

## 32. Final Recommended Direction

Build:

> A secure, self-hosted, Next.js BFF trip planner with Better Auth, Postgres RLS, Mapbox, Gemini AI, Docker, and Nginx.

Start with:

> A responsive web app, not a native mobile app.

Focus on:

> Real trip planning with real people.

Do not focus yet on:

- monetization
- social features
- bookings
- public community content
- advanced expense splitting

---

## 33. Next Step

The next implementation step is:

1. initialize Next.js project
2. setup Docker + Postgres
3. setup Better Auth
4. create Trip schema
5. create protected trip dashboard
6. implement Mapbox map + search proxy
7. implement trip items
8. implement day itinerary
9. implement invite/share links
10. deploy staging and production to Hostinger VPS