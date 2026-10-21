# ABCDrone: clinic web app

Clinic-facing dashboard for the Duke EGR 101 ABCDrone project: a drone-mountable
carrier that picks up saliva samples from patients' homes and flies them back to
the clinic. Each carrier (ESP32 + temperature sensor + SIM7080G GNSS/cellular)
uploads temperature and GPS to ThingSpeak. This app lets clinic staff watch the
drones live.

> **Status:** Phase 1 (mock data, UI, dev auth bypass). Supabase auth arrives in Phase 2
> and the real ThingSpeak connection in Phase 3.

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

| Variable                | Values                 | Purpose                                                                    |
| ----------------------- | ---------------------- | -------------------------------------------------------------------------- |
| `VITE_TELEMETRY_SOURCE` | `mock` \| `thingspeak` | Where drone data comes from (default `mock`)                               |
| `VITE_AUTH_BYPASS`      | `true` \| `false`      | Skip login as a fake clinic user. **Dev only**: ignored by `npm run build` |

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
    auth/       AuthProvider + useAuth (Supabase in Phase 2)
    drones/     drone-specific UI: badges, maps, chart, alert banner
    telemetry/  TelemetryProvider interface, mock + ThingSpeak implementations, hooks
  config/       tunable numbers and env parsing (start here to change behaviour)
  lib/          small helpers (formatting, geo math)
  types/        domain types: Drone, TelemetryPoint, DroneStatus
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

- **Phase 2:** Supabase email/password + Google login, `profiles` with roles,
  route guards, SQL migration with row-level security.
- **Phase 3:** `ThingSpeakTelemetryProvider`, the field-mapping config, and
  instructions for pointing at a real channel.
