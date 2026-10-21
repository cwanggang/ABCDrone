# ABCDrone: clinic web app

Clinic-facing dashboard for the Duke EGR 101 ABCDrone project: a drone-mountable
carrier that picks up saliva samples from patients' homes and flies them back to
the clinic. Each carrier (ESP32 + temperature sensor + SIM7080G GNSS/cellular)
uploads temperature and GPS to ThingSpeak. This app lets clinic staff watch the
drones live.

> **Status:** Phases 1–2 done (mock data, UI, Supabase auth with roles, connected
> to a live Supabase project). Deployment to Vercel is being set up. The real
> ThingSpeak connection arrives in Phase 3. See [`plan.md`](plan.md) for progress.

## Quick start (mock mode)

Requires Node 20+ (developed on Node 24).

```bash
npm install
cp .env.example .env.local   # defaults: mock telemetry + dev auth bypass
npm run dev                  # http://localhost:5173
```

You'll land on the dashboard as a fake clinic user, watching four simulated drones:

| Drone        | Behaviour                                                       |
| ------------ | --------------------------------------------------------------- |
| Blue Devil 1 | Parked at Duke University Hospital (idle)                       |
| Blue Devil 2 | Loops to Raleigh (~28 mi) and back                              |
| Blue Devil 3 | Loops to Sanford (~39 mi) and back; occasionally gets too cold  |
| Blue Devil 4 | Lost contact 10 min before you opened the app, so shows offline |

Every drone's temperature drifts out of the safe range for about a minute every
7–13 minutes, so you can see the alert UI.

## Scripts

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                     |
| `npm run build`   | Type-check, then production build to `dist/`   |
| `npm run preview` | Serve the production build locally             |
| `npm run lint`    | ESLint                                         |
| `npm run format`  | Prettier (rewrites files)                      |
| `npm test`        | Run tests once (`npm run test:watch` to watch) |

## Environment variables

All variables are listed and explained in [`.env.example`](.env.example). Put your
values in `.env.local`, which git ignores.

| Variable                 | Values                 | Purpose                                                                    |
| ------------------------ | ---------------------- | -------------------------------------------------------------------------- |
| `VITE_TELEMETRY_SOURCE`  | `mock` \| `thingspeak` | Where drone data comes from (default `mock`)                               |
| `VITE_AUTH_BYPASS`       | `true` \| `false`      | Skip login as a fake clinic user. **Dev only**: ignored by `npm run build` |
| `VITE_SUPABASE_URL`      | URL                    | Your Supabase project URL                                                  |
| `VITE_SUPABASE_ANON_KEY` | string                 | Your Supabase anon (public) key. **Never** the service_role key            |

## Connecting Supabase (login + roles)

1. **Create a project** at [supabase.com](https://supabase.com). Copy the project
   URL and anon key (Project Settings → API) into `.env.local` as
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
2. **Run the migration.** Open the dashboard's SQL Editor, paste
   [`supabase/migrations/20261021120000_init.sql`](supabase/migrations/20261021120000_init.sql)
   and click Run. This creates `profiles` (with a `role` column), `drones`, and
   their row-level security policies. (Supabase CLI users: `supabase db push`.)
3. **Allow the app's URLs.** Authentication → URL Configuration:
   - Site URL: `http://localhost:5173` (switch to the production URL when you deploy; see "Deploying to Vercel")
   - Redirect URLs: add `http://localhost:5173/**`
4. **Turn on Google sign-in** (optional):
   1. In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services →
      Credentials, create an **OAuth client ID** of type _Web application_.
   2. Under _Authorized redirect URIs_, add the callback URL shown in Supabase →
      Authentication → Providers → Google (it looks like
      `https://<project-ref>.supabase.co/auth/v1/callback`).
   3. Paste the Google client ID and secret into that Supabase Google provider page and enable it.
5. **Create clinic accounts.** Users can sign in with Google, or you can add
   email/password users in Authentication → Users → Add user. Every new account
   starts as a **patient** and sees "No access". Grant clinic access in the SQL Editor:
   ```sql
   update public.profiles set role = 'clinic'
   where id = (select id from auth.users where email = 'someone@duke.edu');
   ```
   The user may need to reload the page to pick up the new role.
6. **Turn off the bypass:** set `VITE_AUTH_BYPASS=false` in `.env.local` and restart `npm run dev`.

**How access is enforced.** In the browser, route guards (`RequireAuth`,
`RequireRole` in `src/features/auth/`) redirect signed-out users to `/login` and
show "No access" to non-clinic users. But the browser can't be trusted, so the
real enforcement is in the database: row-level security lets users read only
their own profile, never change their role, and only clinic users read `drones`.

## Deploying to Vercel

The app builds to static files, so Vercel just serves `dist/`.
[`vercel.json`](vercel.json) sends every path to `index.html`. Without it,
refreshing `/drones/<id>` or coming back from Google sign-in (`/login?next=…`)
would 404, because those aren't real files. Real files such as `/assets/*.js`
are still served directly.

1. **Create the project** in Vercel from this repo. The Vite preset fills in
   build command `npm run build` and output directory `dist`.
2. **Add environment variables** (Settings → Environment Variables) _before_ the
   first build: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
   `VITE_TELEMETRY_SOURCE=mock`. Vite bakes these into the bundle at build time,
   so **redeploy after changing any of them**. `VITE_AUTH_BYPASS` isn't needed:
   production builds always require a real sign-in.
3. **Allow the production URL in Supabase** (Authentication → URL Configuration):
   - Site URL: your production URL, e.g. `https://abcdrone.vercel.app`
   - Redirect URLs: add `https://abcdrone.vercel.app/**` (keep `http://localhost:5173/**` for dev)
   - Optional, for preview deploys: `https://*-<your-vercel-team>.vercel.app/**`

   The Google redirect URI in Google Cloud is the Supabase callback, so it doesn't
   change. If the Google consent screen is in "Testing" mode, only listed test
   users can sign in.

4. **Smoke-test:** refresh on a drone detail page, sign in with a password and
   with Google, and check that a patient account sees "No access".

### Security note

Every `VITE_` variable is compiled into the JavaScript that ships to the browser,
so **anyone who can open the site can read it**. That is fine for the Supabase
URL and anon key (they are designed to be public and protected by row-level
security). It is **not** fine for ThingSpeak read API keys long-term: a visitor
could read every drone's GPS history, which reveals patients' home locations.
Before real deployment, move ThingSpeak reads into a Supabase Edge Function that
holds the keys server-side and checks the caller is clinic staff. Only
`ThingSpeakTelemetryProvider` would need to change.

## How it's put together

```
src/
  app/          router, providers, layout shell (sidebar + top bar)
  pages/        one folder per route
  components/   shared UI (shadcn/ui components live in components/ui)
  features/
    auth/       AuthProvider + useAuth (Supabase or dev bypass), route guards
    drones/     drone-specific UI: badges, maps, chart, alert banner
    telemetry/  TelemetryProvider interface, mock + ThingSpeak implementations, hooks
  config/       tunable numbers and env parsing (start here to change behaviour)
  lib/          Supabase client, small helpers (formatting, geo math)
  types/        domain types: Drone, TelemetryPoint, DroneStatus
supabase/migrations/   SQL schema + row-level security
```

**Telemetry flows one way:** a `TelemetryProvider` (mock or ThingSpeak) is read
only by the hooks in `features/telemetry/`: `useDrones`, `useDroneTelemetry(id)`,
`useAllDronesTelemetry()` and `useDroneHistory(id)`. They poll every 5 s with
TanStack Query. Components never talk to a provider directly, so switching data
sources never touches UI code.

**Status is derived, not stored** (`features/telemetry/deriveStatus.ts`):

- `offline`: no update in the last 2 minutes
- `in_flight`: speed above 0.5 m/s
- `idle`: otherwise (parked at the clinic, or landed at a pickup)

Data older than 45 s (about three missed ThingSpeak uploads) is marked **stale**
wherever it's shown.

**Tunable settings** live in `src/config/telemetry.ts`: the safe temperature range
(default **2–8 °C**), the status thresholds, the stale cutoff, the polling
interval and the history window. Change a number there and the whole app,
including the mock data, follows.

## ThingSpeak field mapping

This is a contract with the hardware team: the firmware must write these fields.
It lives in `src/config/thingspeakFields.ts` (added in Phase 3).

| ThingSpeak field | Meaning            | Unit            |
| ---------------- | ------------------ | --------------- |
| `field1`         | Sample temperature | °C              |
| `field2`         | Latitude           | decimal degrees |
| `field3`         | Longitude          | decimal degrees |
| `field4`         | Ground speed       | m/s             |
| `field5`         | Battery            | %               |

ThingSpeak's free tier allows one update every 15 s per channel and at most 4
channels, so plan on one channel per drone and at most four drones.

## Coming in later phases

- **Phase 3:** `ThingSpeakTelemetryProvider`, the field-mapping config, and
  instructions for pointing at a real channel.
