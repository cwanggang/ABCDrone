# ABCDrone: clinic web app

Clinic-facing dashboard for the Duke EGR 101 ABCDrone project: a drone-mountable
carrier that picks up saliva samples from patients' homes and flies them back to
the clinic. Each carrier (ESP32 + temperature sensor + SIM7080G GNSS/cellular)
uploads temperature and GPS to ThingSpeak. This app lets clinic staff watch the
drones live.

> **Status:** Phases 1–2 done (mock data, UI, Supabase auth with roles) and
> deployed to Vercel (with mock data). Phase 3 adds the real ThingSpeak
> connection, for local use until the read keys move server-side. See
> [`plan.md`](plan.md) for progress.

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

| Variable                    | Values                 | Purpose                                                                                        |
| --------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| `VITE_TELEMETRY_SOURCE`     | `mock` \| `thingspeak` | Where drone data comes from (default `mock`)                                                   |
| `VITE_AUTH_BYPASS`          | `true` \| `false`      | Skip login as a fake clinic user. **Dev only**: ignored by `npm run build`                     |
| `VITE_SUPABASE_URL`         | URL                    | Your Supabase project URL                                                                      |
| `VITE_SUPABASE_ANON_KEY`    | string                 | Your Supabase anon (public) key. **Never** the service_role key                                |
| `VITE_THINGSPEAK_READ_KEYS` | JSON object            | Read keys for private channels, `{"<channel id>":"<key>"}`. **Local only** (see Security note) |

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
It lives in `src/config/thingspeakFields.ts`. Fields 6–8 are free for future sensors.

| ThingSpeak field | Meaning            | Unit            |
| ---------------- | ------------------ | --------------- |
| `field1`         | Sample temperature | °C              |
| `field2`         | Latitude           | decimal degrees |
| `field3`         | Longitude          | decimal degrees |
| `field4`         | Ground speed       | m/s             |
| `field5`         | Battery            | %               |

ThingSpeak's free tier allows one update every 15 s per channel and at most 4
channels, so plan on one channel per drone and at most four drones.

## Pointing at a real ThingSpeak channel

1. **Find the channel id and read key.** In ThingSpeak, open the drone's channel.
   The id is on the channel page; the read key is under _API Keys_ → _Read API Keys_.
   (Public channels need no key.)
2. **Register the drone in Supabase** (SQL Editor), one row per drone:
   ```sql
   insert into public.drones (id, name, thingspeak_channel_id)
   values ('blue-devil-1', 'Blue Devil 1', '1234567');
   ```
   `id` is the URL slug (lowercase letters, digits and dashes). Home base defaults
   to Duke University Hospital.
3. **Point the app at ThingSpeak** in `.env.local`, then restart `npm run dev`:
   ```bash
   VITE_TELEMETRY_SOURCE=thingspeak
   VITE_AUTH_BYPASS=false          # the drone list needs a real Supabase sign-in
   VITE_THINGSPEAK_READ_KEYS={"1234567":"ABCDEFGHIJKLMNOP"}
   ```
4. **Sign in as a clinic user.** The top bar shows a "ThingSpeak" badge instead of
   "Mock data".

**How it reads data** (`src/features/telemetry/thingspeak/`):

- `getLatest` calls `/channels/<id>/feeds.json?results=1` and `getHistory` calls
  `/channels/<id>/feeds.json?minutes=30`. We don't use `/feeds/last.json` because
  it answers `-1` both for an empty channel and for a wrong read key.
- Every field is parsed with Zod (`thingspeakSchema.ts`). A field that is missing or
  isn't a number becomes "no reading" rather than an error, a `0,0` position counts
  as "no GPS fix", and an entry without a valid timestamp is skipped.
- **Drone list:** read from the Supabase `drones` table. If that fails (Supabase not
  configured, a network error, or no session because the dev bypass is on), the
  app uses the built-in list in `src/config/drones.ts` and shows an amber banner
  saying why. Keep that file in sync with the table.

**Troubleshooting.** "wasn't found, or it is private and its read key is missing
or wrong": check the channel id in Supabase and the key in
`VITE_THINGSPEAK_READ_KEYS`. A drone that shows offline with no data has a
channel with no entries yet. Restart `npm run dev` after editing `.env.local`.

### Moving the read keys to an Edge Function (before real deployment)

Don't set `VITE_THINGSPEAK_READ_KEYS` in Vercel: anyone who loads the site could
pull the keys out of the JavaScript and read every drone's GPS history (see
Security note). Until the keys move server-side, keep the deployed site on
`VITE_TELEMETRY_SOURCE=mock`. The plan for the move:

1. A Supabase Edge Function (e.g. `thingspeak-feed`) that takes a drone id and
   `results` or `minutes`, checks the caller's JWT belongs to a clinic user
   (`is_clinic()`), looks up the drone's channel, and calls ThingSpeak with a read
   key stored as a function secret (`supabase secrets set ...`).
2. Change only `ThingSpeakTelemetryProvider.readFeed` to call
   `supabase.functions.invoke('thingspeak-feed', ...)` instead of ThingSpeak.
   Parsing, hooks and UI stay the same.
3. Delete `VITE_THINGSPEAK_READ_KEYS` and rotate the read keys (any that were in a
   bundle should be treated as leaked).

## Coming in later phases

- Move ThingSpeak reads (and keys) into a Supabase Edge Function, then switch the
  deployed site to `thingspeak`.
- Duke SSO, patient-facing side, Missions / Patients / Settings pages. See
  [`plan.md`](plan.md).
