# Trip Planning MVP — Current Plan

## 1. Product Goal

Build a **lean, creative, solo-dev maintainable trip planner as a portfolio piece**: a live product a reviewer can try in two minutes, backed by a real trip planned with real people.

This is **not a market launch product** and **not a business seed for now**.

What it needs to show:

- one clear point of view on trip planning
- a few flows finished to a high standard, rather than many features
- decisions and trade-offs that can be explained in a case study

The experience to deliver:

> A traveler collects places from wherever they found them, sees them on a map, shapes them into days, and shares one good-looking page that friends open on their phones.

---

## 2. MVP Concept

### Name

**Tusafiri** — Swahili for "let's travel". Renamed from the working name TripBoard.

### Look

Dark and light themes led by acacia green and savanna yellow. Green is for primary actions and links, yellow marks anything selected, and terracotta appears only as the third day colour. Grounds are a clean off-white and a green-black rather than beige and brown, to stay clear of the luxury-safari look. Type is Space Grotesk with JetBrains Mono labels.

### One-line description

A trip board where a traveler collects places on a map, organizes them into a day-by-day itinerary, and shares the plan as a single page.

### Who uses it

- **The organizer** plans the trip, mostly on a laptop.
- **The friend** opens a link from a chat, on a phone, with no account.
- **The reviewer** opens the portfolio link, has no account, and gives it two minutes.

### Core loop

```text
Create trip (destination, optional interests)
  ↓
Add places (suggestions, search, or paste a list)
  ↓
See places on map
  ↓
Assign places to days
  ↓
Share one page
  ↓
Use it on the trip (Today view)
```

### Signature moments

These three get polished first. Everything else supports them.

1. **Map and itinerary move together.** Pins are colored by day, selecting an item highlights its pin and the reverse, and a straight line connects each day's stops in order.
2. **Paste-to-import.** Paste a messy list or a friend's message; it becomes places the user reviews before adding.
3. **The share page.** A phone-first page that makes the trip look good and is useful during the trip.

---

## 3. MVP Principles

### Keep it lean

Build only what is needed to plan a real trip.

### Depth over breadth

Finish three flows properly, including empty, loading and error states, before starting a fourth.

### Try before sign-in

A visitor can see a real trip without creating an account.

### Keep it useful

The app must be useful even without AI.

### Keep it secure

Trip data must only be accessible to its owner and to people holding a share link.

### Keep it maintainable

Use a simple stack that one developer can manage.

### Keep it testable

The app should be usable for a real trip as soon as possible.

---

## 4. MVP Scope

## Included

- Demo trip viewable without login (seeded, read-only)
- User authentication
- Trip creation from destination only, with an optional interests step
- Trip details, all optional and editable later:
  - name
  - start date
  - number of days
  - number of travelers
  - currency
  - notes
  - interests
  - cover emoji / color
- Suggested places for the destination, based on interests (checked against place search, added only when the user adds them)
- Add places by map search
- Add places by pasting a list (AI import, reviewed before adding)
- Add a place by dropping a pin (fallback when search fails)
- Map view with pins colored by day
- Unassigned "ideas" list
- Assign places to days
- Days work without dates (Day 1, Day 2, ...)
- Reordering:
  - drag-and-drop on desktop
  - "Move to day" menu on touch screens
- "Group by area" suggestion for unassigned places
- One optional estimated cost per item
- Total estimate and estimate per person
- Public read-only share page, phone-first
- "Open in Google Maps" on every item
- Today view during the trip
- Responsive web app
- Production environment

## Stretch

Only after everything above is polished:

- Guest reactions on the share page (👍 / must-do / skip, name only, no account)
- Trip recap: items marked done become a shareable record of the trip

## Excluded for now

Moved out of the previous scope:

- Invited editors and member roles — a reviewer never sees them, and a share link covers friends
- Staging environment — overhead with no users to protect yet
- Budget target and under/over indicator — the per-person estimate is the useful part
- Mood tags — interests cover the same ground
- Geocode caching — not needed at this traffic, and restricted by Mapbox terms

Excluded as before:

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
- Directions / routing
- Calendar sync
- Email import
- Instagram/TikTok import

---

## 5. Technology Stack

### Web and BFF (`apps/web`)

- **Next.js** with App Router, as the UI and a thin backend-for-frontend
- **TypeScript**
- **Mantine** for components, theme and forms
- **Tailwind CSS** for layout and spacing utilities
- **Zod**
- **@mantine/form**
- **TanStack Query** for server data on the client
- **dnd-kit** for drag-and-drop
- **Mapbox GL JS** for map rendering

### API (`apps/api`)

- **NestJS**, holding the business rules
- **Node.js**
- **TypeScript**
- **Drizzle ORM**
- **PostgreSQL**
- **Better Auth**

### Shared (`packages/shared`)

- Zod schemas and the types inferred from them, used by both apps

### Standards

- pnpm workspace, laid out and built by the stack-kit skills with the profile `--web next --api nest --db drizzle`

### Third-party services

- **Mapbox**
  - map rendering
  - place search
- **Google Gemini**
  - paste-to-import
  - place suggestions

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

- the NestJS API
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
Next.js (UI + BFF)
  ↓ internal network only
NestJS API
  ↓
Postgres / Mapbox / Gemini
```

Next.js renders pages and forwards requests. Business rules, validation against the database, and every ownership check live in the NestJS API. A rule is never written in both places.

### Why BFF?

- Protects secrets
- Enforces authentication
- Enforces authorization
- Allows rate limiting
- Allows input validation
- Gives one central security boundary

---

## 7. Authentication Plan

Use **Better Auth** with **Google sign-in only**.

Reasons:

- self-hosted
- works with the BFF session-cookie pattern
- simple for testers
- no passwords to store, reset or leak

### No login required for

- the landing page
- the demo trip
- public share pages

### Strategy (proposed, pending review)

The yardsticks are the IETF guidance for browser-based apps, which ranks the BFF pattern as the most secure, and the cookie and session requirements of OWASP ASVS 5.0 Level 2.

- **One owner.** Better Auth runs in the NestJS API, which owns the user and session tables. Next.js never touches the database.
- **One origin.** The browser only talks to the app's own domain. Next.js forwards `/api/auth/*` to the API, so the session cookie is first-party.
- **One cookie, no tokens in the browser.** A server-side session with an opaque id in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie, host-only, with a `__Host-` or `__Secure-` name prefix. Nothing in `localStorage`, no JWT in client code.
- **Every request checked in the API.** Next.js forwards the cookie. A global guard in the API looks the session up and every query is scoped to that user. A cookie check in Next.js is only for redirects.
- **API not public.** Only Next.js can reach the API, over the internal Docker network.
- **CSRF.** `SameSite=Lax`, plus Better Auth's origin check with the app's domain as the only trusted origin.
- **Sessions.** Seven-day expiry, extended daily while in use. Sign-out deletes the session on the server.
- **Rate limiting** on the auth routes, with the proxy header configured so the real client address is used.
- **No unused features.** Email and password sign-in, API keys and device authorisation stay off. Most of Better Auth's published advisories were in those parts.
- **Kept current.** Dependency alerts on, and Better Auth upgraded promptly.

Later, if testers without a Google account need in: an email one-time code or a passkey, added through Better Auth.

### To confirm in the first build

- The NestJS integration is a community package (`@thallesp/nestjs-better-auth`). If it gets in the way, mount Better Auth's own request handler in the API and write the guard by hand.
- Google's sign-in redirect working when `/api/auth/*` is forwarded through Next.js. Better Auth's docs do not cover this split setup.
- Use the stable Drizzle line. Better Auth's Drizzle adapter defaults to it, and Drizzle 1.0 is still a release candidate.

---

## 8. Authorization Model

### Core rule

A signed-in user can access a trip only if they own it.

Anyone holding a valid share link can view that trip's read-only share page.

Everything else is denied.

### Roles

- **owner**
  - full control
  - can delete trip
  - can create and revoke share links
- **public share viewer**
  - read-only
  - no login required
  - cannot see account data

Editors come back only if invited collaboration returns to scope.

### Enforcement

One server function loads a trip for the current session and checks ownership. Every trip and item query goes through it.

Postgres Row Level Security is deferred. With a single owner per trip it duplicates that one check; revisit it when a trip can have more than one member.

---

## 9. Database Plan

Use PostgreSQL with UUID primary keys.

### Core tables

#### users

Handled by Better Auth.

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
- destination_latitude
- destination_longitude
- start_date
- day_count
- travelers_count
- currency
- notes
- interests
- cover_emoji
- cover_color
- is_demo
- created_at
- updated_at
```

`start_date` is optional. The end date is derived from `start_date` and `day_count`.

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
- day_index
- sort_order
- start_time
- created_at
- updated_at
```

`day_index` is the day number (1, 2, 3, ...). Empty means the item is still an unassigned idea.

Items store a day number, not a date, so a trip without dates can still have days and moving the trip's dates changes nothing on its items.

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

`idea` means no day assigned. Keep status and `day_index` in sync in one place.

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

### Removed from the previous plan

```text
trip_members
trip_invites
geocode_cache
```

### Constraints

- UUID primary keys
- foreign key constraints
- check constraints for latitude/longitude
- check constraints for cost >= 0
- check constraint for day_index between 1 and day_count
- prevent changing `trip_id` on item update
- unique hashed share tokens
- expiry timestamps for share links

---

## 10. API Plan

All protected endpoints must:

1. validate the session
2. load the trip through the ownership check
3. validate the input with Zod
4. return only safe data

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

### Share links

```text
createShareLink
revokeShareLink
getPublicSharedTrip
```

### Demo

```text
getDemoTrip
```

Read-only. Visitors can never modify it.

### Map search

```text
GET /api/maps/search?q=time+out+market&near=-9.14,38.71
```

This endpoint:

- requires authentication
- validates query
- rate limits requests
- calls Mapbox place search using server token
- biases results toward the trip destination
- returns minimal safe data

### Import

```text
POST /api/ai/import
```

This endpoint:

- requires authentication
- checks trip ownership
- limits pasted text length
- rate limits requests
- calls Gemini to extract candidate places
- looks up each candidate with place search near the destination
- returns matched and unmatched candidates
- writes nothing to the database

### Suggestions

```text
POST /api/ai/suggest
```

This endpoint:

- requires authentication
- checks trip ownership
- rate limits requests
- sends the destination and the trip's interests to Gemini
- asks for a handful of candidate places
- looks up each candidate with place search near the destination
- drops any candidate that search cannot find
- returns the remaining places with coordinates
- writes nothing to the database

---

## 11. Mapbox Plan

### Usage

Use Mapbox for:

- map rendering
- displaying pins
- searching places (restaurants, sights, venues), not only cities
- looking up the destination when a trip is created

### Tokens

Use two tokens:

```text
NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN
MAPBOX_SERVER_TOKEN
```

The public token is restricted to the app domain and to map rendering. The server token is used only by the BFF for search.

### Storing results

Saving a place's name and coordinates on a trip item is storing a search result.

Mapbox separates temporary results, which may not be stored, from permanent ones, which may and are billed differently.

Before Phase 3:

- confirm which search product returns the places needed
- confirm its storage terms and enable permanent mode where required
- confirm current free-tier limits on Mapbox's pricing page

### Place details

Mapbox results carry no photos, ratings or opening hours.

Every item gets an **Open in Google Maps** link, which covers details and directions without another API.

### Free-tier protection

- debounce search input
- require minimum characters
- limit result count
- avoid Directions API
- avoid Matrix API
- set budget alerts in Mapbox dashboard

---

## 12. AI Plan

### Use case

AI is optional and assistive.

It should not be required for basic planning.

### AI feature 1: paste-to-import

Input:

- pasted text (a list, a friend's message, notes)
- trip destination

Output:

- candidate places with title, category and an optional note

Flow:

```text
Paste text
  ↓
Gemini extracts candidate places
  ↓
Each candidate is looked up with place search
  ↓
Review screen: found places show a pin, the rest are marked "could not find"
  ↓
User picks which ones to add
```

### AI feature 2: suggested places

Makes the first minutes faster: the workspace opens with places to pick from instead of an empty panel.

Input:

- trip destination
- interests the user picked (optional step after the destination, editable in trip settings)

Output:

- a handful of candidate places with title and category

Flow:

```text
Pick interests (or skip)
  ↓
Gemini proposes candidate places
  ↓
Each candidate is looked up with place search
  ↓
Only places that search finds are shown, as dashed pins and a list
  ↓
User adds one, several, or all to Ideas
```

Skipping interests leads to the plain empty workspace. Suggestions stay available later in the Ideas tab.

### Not AI: Group by area

Grouping unassigned places into days by how close they are is done in code.

It is predictable, free and cannot invent places.

The user sees the suggestion per day and accepts or ignores it.

---

## 13. AI Security Rules

### Safe to send

- destination
- trip interests
- the text the user chose to paste

### Do not send

- user emails
- user IDs
- share tokens
- session cookies
- API keys
- any other trip data

### Pasted text

- tell the user the pasted text is sent to an AI service
- cap its length
- treat it as data, never as instructions

### AI output rules

- require structured JSON
- validate with Zod
- do not trust place existence; confirm through place search
- do not automatically write to database
- user confirms before anything is added

---

## 14. Frontend Plan

### Main screens

#### 1. Landing

Shows:

- what it is in one line
- the demo trip, one click away, no account
- sign in

#### 2. Dashboard

Shows:

- user's trips
- create trip (destination, then an optional interests step, then the map)

#### 3. Trip workspace

Main planning screen.

Contains:

- map, centered on the destination
- ideas list (unassigned places)
- suggested places
- day itinerary
- item details drawer
- import
- share

#### 4. Public share page

The page most people will see. Designed phone-first.

Shows:

- cover and trip summary
- days and estimate per person
- map
- day plan
- Open in Google Maps on every item

Does not show:

- owner email
- admin controls
- private account data

#### 5. Today view

During the trip dates, the workspace and the share page open on today's plan.

The owner can mark items done.

#### 6. Trip settings

Edit:

- trip name
- destination
- start date and number of days
- travelers
- currency
- interests
- notes
- cover emoji/color

### States

Every screen has a designed empty, loading and error state. The empty workspace is the first thing a new user sees and gets the most care.

---

## 15. Mobile Plan

Do not build a native mobile app.

- Share page and Today view are designed for a phone first.
- The workspace is designed for a laptop first and stays usable on a phone.
- On touch screens, "Move to day" replaces drag-and-drop, which fights map and scroll gestures.

Main mobile tabs in the workspace:

```text
Map
Itinerary
Ideas
```

---

## 16. Environment Plan

Use one deployed environment:

```text
Production
```

Local development runs with Docker.

Staging is deferred. Until then:

- run migrations locally against a copy of the production dump first
- take a backup before every deploy

### Production rules

- HTTPS only
- secure cookies
- strict environment variables
- backups enabled
- error logging enabled
- rate limiting enabled

---

## 17. Deployment Plan

### Hosting

Hostinger VPS.

### Containers

```text
web   = Next.js
api   = NestJS (not exposed outside the Docker network)
db    = PostgreSQL
nginx = reverse proxy
```

### Docker principles

- Postgres not exposed publicly
- app and DB on internal Docker network
- Nginx exposed on ports 80/443
- environment variables not committed
- strong Postgres passwords

### Suggested command

```bash
docker compose --env-file .env.prod -p tusafiri-prod up -d --build
```

### Nginx

Responsibilities:

- SSL termination with Certbot + Let's Encrypt
- HTTP -> HTTPS redirect
- proxy to Next.js with proper proxy headers
- security headers
- basic rate limiting if needed

---

## 18. VPS Security Checklist

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

## 19. Backup Plan

At minimum:

- daily Postgres dump
- compress dump
- store for at least 7 days
- test restore process

Example target:

```text
/backups/tusafiri-prod-YYYY-MM-DD.sql.gz
```

Later:

- upload backups to off-server storage

---

## 20. Testing Plan

### Before building

Ask 3–5 friends how they planned their last trip:

- which tools they used
- where places came from
- where it got annoying

This gives the case study a "before".

### Test with real trips

1. one trip of your own, planned as soon as the itinerary works
2. one trip shared with friends through the share link

### Observe

- Is trip creation fast?
- Does paste-to-import save time, and how often does it fail to find a place?
- Does the map help?
- Do days get used, or do places stay as ideas?
- Do friends open the share page, and on which device?
- Was it opened during the trip?

---

## 21. Security Test Checklist

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
- non-owner cannot access trip by direct URL

### Item access

- user cannot edit item from another trip
- user cannot delete item from another trip
- user cannot move item to another trip

### Public share

- public share link is read-only
- public share link does not expose emails
- revoked share link stops working

### Demo trip

- visitors cannot modify the demo trip
- the demo trip exposes no account data

### Import

- oversized pasted text is rejected
- instructions inside pasted text change nothing
- nothing is written before the user confirms

### API

- invalid input rejected
- unexpected fields rejected
- rate limiting works
- errors do not leak secrets or stack traces

---

## 22. Build Roadmap

## Phase 1: Foundation

Goal:

> Basic app runs locally and on VPS.

Tasks:

- scaffold the pnpm workspace with the stack-kit skills (Next.js, NestJS, Drizzle)
- shared package with the first Zod schemas
- setup Postgres with Docker Compose
- setup Drizzle, first migration, seed
- NestJS API skeleton with health checks
- Next.js web skeleton with the Mantine theme built from the Figma colour tokens, light and dark
- setup CI
- setup Nginx
- setup production domain

## Phase 2: Authentication

Goal:

> Users can log in securely.

Tasks:

- setup Better Auth in the API
- setup Google sign-in
- forward the auth routes and the session cookie through Next.js
- test that one user cannot read another's trip
- protect dashboard
- create user session handling
- create logout

## Phase 3: Trips + Places + Map

Goal:

> A user can start a trip from a destination and put places on the map.

Tasks:

- confirm Mapbox search product, storage terms and limits
- create trip from destination
- list, edit and delete trips
- integrate Mapbox map
- create map search endpoint
- add place from search
- add place by dropping a pin
- edit and delete place
- item drawer with notes and estimated cost
- Open in Google Maps link

## Phase 4: Itinerary

Goal:

> Users can organize places into days and see the days on the map.

Tasks:

- days by number, dates optional
- ideas list
- assign item to day
- reorder items
- drag-and-drop on desktop
- "Move to day" menu on touch screens
- pins colored by day
- selection synced between list and map
- line connecting each day's stops

## Checkpoint: plan a real trip of your own

Fix what is annoying before going further.

## Phase 5: Share page + demo trip

Goal:

> Anyone can see a trip without an account.

Tasks:

- share link
- revoke share link
- phone-first public share page
- total and per-person estimate
- seeded demo trip
- landing page with the demo trip

## Checkpoint: share a real trip with friends

## Phase 6: Import, suggestions, Group by area

Goal:

> Getting places in is fast.

Tasks:

- import endpoint
- call Gemini
- validate JSON
- verify candidates through place search
- review screen
- group-by-area suggestion
- interests step in trip creation
- suggestion endpoint, checked through place search
- suggested places in the workspace and the Ideas tab

## Phase 7: On the trip

Goal:

> The plan is useful during the trip.

Tasks:

- Today view
- mark items done

## Phase 8: Polish + security pass

Goal:

> It feels finished and is safe to leave online.

Tasks:

- empty, loading and error states
- accessibility pass
- performance pass on the share page
- rate limiting
- security headers
- backup script
- security test checklist

## Phase 9: Case study

Goal:

> The work can be explained.

Tasks:

- the problem and who has it
- how friends planned trips before
- the key decisions and what was cut, with reasons
- what the real trips showed
- what would come next

---

## 23. Definition of MVP Success

The MVP is successful if:

- a reviewer understands what it is and tries the demo trip within two minutes, without signing in
- you planned a real trip with it and opened it during the trip
- friends opened the share page on their phones without help
- the three signature moments feel finished, including empty, loading and error states
- the case study can explain each scope decision
- you want to use it again for the next trip

---

## 24. Main Risks

### Scope creep

Risk:

- many half-finished features instead of a few finished ones

Solution:

- three signature moments first
- stretch items stay stretch

### Looks like a clone

Risk:

- reads as a smaller version of existing trip planners

Solution:

- lead with the signature moments
- the case study explains the point of view and the cuts

### Place search quality

Risk:

- search does not find the restaurant or sight the user wants

Solution:

- bias results toward the destination
- drop-a-pin fallback
- Open in Google Maps for details

### Map API costs and terms

Risk:

- too many search requests, including the checks behind each suggestion
- storing results in a way the terms do not allow

Solution:

- debounce and rate limiting
- a handful of suggestions per request, not dozens
- budget alerts
- confirm storage terms before Phase 3

### AI hallucinations

Risk:

- import or suggestions return places that do not exist

Solution:

- every candidate is confirmed through place search
- user confirms before anything is added

### Generic suggestions

Risk:

- suggestions read like the same top-ten list every planner shows

Solution:

- interests narrow what is proposed
- the user's own places stay first: paste and search sit beside every suggestion list
- watch in the real trips whether suggestions get added or ignored

### Authorization bugs

Risk:

- users accessing trips they should not see

Solution:

- session-based auth
- one server-side ownership check
- security testing

### No staging environment

Risk:

- a bad deploy or migration breaks the live demo

Solution:

- test migrations locally against a production dump
- backup before every deploy

---

## 25. Final Recommended Direction

Build:

> A self-hosted trip planner with a Next.js BFF and a NestJS API, Better Auth, Postgres with Drizzle, Mapbox, Gemini import and suggestions, Docker, and Nginx, shown through a demo trip anyone can open.

Start with:

> A responsive web app, not a native mobile app.

Focus on:

> Three finished flows, one real trip, and a case study that explains the decisions.

Do not focus yet on:

- monetization
- growth
- invited collaboration
- bookings
- public community content
- expense splitting

---

## 26. Next Step

The next implementation step is:

1. ask 3–5 friends how they planned their last trip
2. confirm Mapbox search product, storage terms and limits
3. review and agree the sign-in strategy in section 7
4. scaffold the workspace with the stack-kit skills (Next.js, NestJS, Drizzle)
5. setup Docker + Postgres, then Better Auth in the API
6. create Trip schema with day numbers
7. implement Mapbox map + search endpoint
8. implement trip items and the day itinerary
9. deploy to the Hostinger VPS
10. plan a real trip with it
