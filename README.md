# Primestar Potato Seeds

A full-stack marketing website, farmer education platform, and worker
referral-tracking system for **Primestar Potato Seeds**, built for
serverless deployment on **Netlify**.

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers / Server Actions + Proxy (middleware) — deployed as Netlify Functions via `@netlify/plugin-nextjs`
- **Database:** PostgreSQL via [Neon](https://neon.tech) (recommended) or Supabase, accessed with Prisma
- **Auth:** Auth.js (NextAuth v5), credentials + JWT sessions, three roles: `ADMIN`, `WORKER`, `FARMER`
- **Weather:** [Open-Meteo](https://open-meteo.com) (free, no API key required)

## Why this stack

Netlify has no traditional always-on server, so everything server-side
(referral tracking, WhatsApp click recording, auth, weather lookups,
admin/worker/farmer dashboards) is implemented as Next.js Route Handlers,
Server Actions, and a Node-runtime Proxy — all of which
`@netlify/plugin-nextjs` automatically deploys as Netlify Functions. Neon
was chosen over a self-hosted database because it's a fully managed,
serverless-friendly Postgres with connection pooling built in (critical
since every function invocation opens a fresh connection) and a generous
free tier — Supabase is a drop-in alternative if you prefer its dashboard
and auth ecosystem, since both are just standard Postgres under Prisma.

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Start a local Postgres database

Easiest via Docker:

```bash
docker run -d --name primestar-pg -e POSTGRES_PASSWORD=primestar -e POSTGRES_DB=primestar -p 5544:5432 postgres:16-alpine
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```
DATABASE_URL="postgresql://postgres:primestar@localhost:5544/primestar"
AUTH_SECRET="<openssl rand -base64 32>"
REFERRAL_HASH_SECRET="<openssl rand -base64 32>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Run migrations and seed demo data

```bash
npx prisma migrate deploy
npm run db:seed
```

The seed script creates:

- An admin account (`admin@primestar.demo`) and three demo workers — John
  Kamau (`JOHN01`), Mary Wanjiku (`MARY02`), Peter Mwangi (`PETER03`) —
  each with a **freshly generated random password printed once to the
  terminal output**. Save it immediately; it is never stored anywhere
  else, and re-running the seed script does not reset it.
- 27 Potato Farming Guide articles across all 4 sections
- 6 sample blog posts
- 6 crop-stage reminder rules
- Default calculator assumptions and weather alert thresholds

Never commit seed output, screenshots, or logs containing these passwords
to a public repository.

### 5. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`. Try a referral link: `http://localhost:3000/?ref=JOHN01`, then sign in as John at `/login` to see the worker dashboard update.

### 6. Run tests

```bash
npm test
```

Tests exercise the referral deduplication logic (including a real
10-concurrent-request race condition test) against your local Postgres
database — they do not use mocks for the database layer, since the whole
point of the feature is a real `UNIQUE(worker_id, ip_hash)` database
constraint.

## Deploying to Netlify

### 1. Create the database

Sign up at [neon.tech](https://neon.tech), create a project, and copy the
**pooled** connection string (it will look like
`postgresql://user:pass@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require`).

### 2. Push this repository to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. Connect the repository to Netlify

In the Netlify dashboard: **Add new site → Import an existing project**,
choose your GitHub repo. Netlify will detect `netlify.toml` automatically,
which sets the build command (`npm run build`) and installs
`@netlify/plugin-nextjs`.

### 4. Configure environment variables

In **Site configuration → Environment variables**, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon **pooled** connection string (host ends in `-pooler`) |
| `DIRECT_URL` | Your Neon **direct** connection string (no `-pooler`) — used only for migrations |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `REFERRAL_HASH_SECRET` | A different `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Your Netlify site URL, e.g. `https://primestar-potatoes.netlify.app` |
| `WHATSAPP_NUMBER` | `254728623619` |

### 5. Run migrations

The build script (`npm run build`) runs `prisma generate && prisma migrate
deploy && next build`, so migrations apply automatically on every deploy as
long as both `DATABASE_URL` and `DIRECT_URL` are set as **build**
environment variables in Netlify (Netlify build environment variables are
available at build time by default; `migrate deploy` specifically needs
`DIRECT_URL` since it can't run through Neon's pooled/PgBouncer connection).
This means there is no separate manual migration step for normal deploys.

For the very first deploy, also seed demo data by running once from your
own machine, pointed at the production database:

```bash
DATABASE_URL="<your-neon-url>" npm run db:seed
```

### 6. Create your real admin account

The seed script creates a **demo** admin for convenience. For production,
either:

- Sign in as the demo admin, then create a proper admin account directly
  in the database (recommended: use `npx prisma studio` against your
  production `DATABASE_URL` to insert a `User` row with `role: ADMIN` and
  a `bcrypt` password hash), then delete the demo admin; or
- Edit `prisma/seed.ts` before the first production seed to use your real
  admin email and a strong password.

**Change the demo admin and demo worker passwords immediately if you seed
demo data into a production database.**

### 7. Deploy

Push to your connected branch — Netlify builds and deploys automatically.
`@netlify/plugin-nextjs` converts:

- Route Handlers (`/api/*`) → individual Netlify Functions
- The Proxy (`src/proxy.ts`, which handles referral click tracking, the
  visitor cookie, and all role-based access control) → a Netlify Edge/Function
  that runs in front of every page request
- Server Components / Server Actions → Netlify Functions rendered on demand

No standalone server process is required or used.

### 8. Test production

1. Open your live site and confirm the homepage loads.
2. Visit `https://yoursite.netlify.app/?ref=JOHN01` from two different
   networks/devices (or use a VPN) and confirm — via the worker dashboard —
   that it counts as 2 clicks, not more, no matter how many times either
   device refreshes.
3. Click a WhatsApp button and confirm the worker dashboard's "WhatsApp
   Clicks" count increases.
4. Sign in to `/admin/dashboard` and confirm the same numbers appear there.

### 9. Add real workers

As the admin, go to **Admin → Workers → Add a Worker**, enter the worker's
name, email, and a unique referral code (letters/numbers/`-`/`_` only).
The system generates a temporary password — use **Reset Access** any time
to issue a new one. Referral codes are enforced unique at the database
level, so duplicates are impossible even under concurrent admin actions.

### 10. Workers get their referral link

Each worker signs in at `/login` and lands on `/worker/dashboard`, which
shows their personal link (`https://yoursite.netlify.app/?ref=THEIRCODE`)
with one-tap **Copy Link**, **Share on WhatsApp**, and **Share** (Web Share
API) buttons.

## How the "one counted click per IP" rule works

1. A visitor opens `.../?ref=JOHN01`.
2. `src/proxy.ts` (a Netlify Function, not client JavaScript) extracts the
   real client IP from Netlify's forwarded headers.
3. The IP is HMAC-hashed with `REFERRAL_HASH_SECRET` (`src/lib/referral.ts`)
   — the raw IP is never written to the database.
4. The referral code is validated against the `workers` table (must exist
   and be `ACTIVE`).
5. A row is inserted into `referral_clicks` with `(worker_id, ip_hash)`.
   This pair has a **database-level `UNIQUE` constraint**
   (`prisma/schema.prisma`), so even two simultaneous requests from the
   same IP can only ever result in one successful insert — the loser gets
   a Postgres unique-violation (`P2002`), which is treated as "already
   counted," not an error.
6. Only on a successful (first-time) or already-counted (valid) result is
   a `referral_code` cookie set, so the same worker stays attributed as the
   visitor browses other pages, for a configurable number of days
   (`site_settings.referral_attribution_days`, default 30).

This is verified by an automated test that fires 10 concurrent requests
from the same simulated IP and asserts exactly 1 row is created —
see `src/lib/__tests__/referral.test.ts`.

**Known limitation (by design):** counting is per-IP, so multiple farmers
sharing one public IP (e.g. the same Wi-Fi network) are counted as a single
referral click for that worker. This is documented for workers and in the
Privacy Policy. The schema keeps a `visitor_id` field on click/conversion
rows so a more precise attribution model can be layered in later without a
schema rewrite.

## Project structure

```
prisma/
  schema.prisma        Full database schema (see below)
  seed.ts               Demo data generator
src/
  auth.ts               Auth.js configuration (credentials + JWT)
  proxy.ts               Referral tracking + role-based route protection
  lib/                   Framework-agnostic business logic (referral hashing,
                         calculators, weather rules, crop-stage engine, etc.)
                         — unit-tested independently of any UI or route.
  components/            Reusable UI, grouped by area (worker/admin/farmer/calculator)
  app/                   Routes (public site, /admin, /worker, /farmer, /api)
```

## Database schema overview

See `prisma/schema.prisma` for the full source of truth. Key tables:

- `users` / `workers` / `farmer_profiles` — one `User` per person, with a
  role-specific profile table for workers and farmers.
- `referral_clicks` — one row per counted click, `UNIQUE(worker_id, ip_hash)`.
- `whatsapp_conversions` — WhatsApp button clicks, optionally attributed to
  a worker via the referral cookie.
- `blog_posts` / `guide_articles` — admin-manageable content.
- `site_settings` / `calculator_settings` / `weather_alert_rule_config` —
  single-row configuration tables editable from `/admin/settings`.
- `farmer_notifications` / `admin_announcements` / `crop_stage_rules` /
  `sent_crop_reminders` / `weather_cache` / `farmer_calculations` — the
  farmer personalization layer (sections 58–82 of the spec this was built
  against).

The schema is deliberately structured so a future commission system can
trace **Worker → Referral Click → WhatsApp Conversion → (future) Order**
without a schema rewrite — see the `referral_code`/`worker_id` fields
carried through each table.

## What's still unverified/not yet supplied

Per the original brief, no business facts were invented. "Since 2019" and
the mission/vision statement have been filled in directly. The following
are still not shown on the site because they haven't been supplied, and can
be added without touching code (via `/admin/settings` where applicable):

- Physical address, opening hours, a dedicated business email
- Certifications, specific fertilizer product/rate recommendations, current market prices
- Exact seed prices (a *default estimate* is configurable in the calculator, not a fixed price)
- Yield guarantees, disease-resistance claims, exact maturity periods

## Security notes

- Passwords are hashed with bcrypt; hashes are never sent to the client.
- All role checks happen server-side (in `src/proxy.ts` and route
  handlers/Server Actions) — the client never supplies its own role or
  user id for anything that matters.
- Authorization is enforced in the Proxy **before** any page component
  renders, specifically to avoid a data-fetching-then-redirect pattern
  where a blocked page's data could be streamed into the response body
  ahead of the redirect (a real issue that was caught in testing).
- Raw visitor IPs are never persisted — only their HMAC hash.
- The weather endpoint validates coordinates, rate-limits per IP, and
  caches results server-side so it can't be used as an open API proxy.
