# ABCDrone clinic app: project plan and progress

This file tracks the flow of the project: what each phase covers, what is done,
and what is still to do. **Keep it up to date as work happens.** Tick items off
when they are finished, and add new items or decisions as they come up.

_Last updated: 2026-10-27 (Vercel deployment done; Phase 3 ThingSpeak provider implemented on the `thingspeak` branch, user steps listed under Phase 3)_

## Goal

A clinic-facing web app for the Duke EGR 101 ABCDrone project. Clinic staff use it
to monitor sample-carrying drones live: position, status, and sample temperature.
Each drone's ESP32 + SIM7080G carrier uploads to its own ThingSpeak channel (free
tier: max 4 channels, one update per 15 s). A patient-facing side comes later; the
app is designed for it but does not build it.

## Decisions made

| Decision                                | Choice                                                                                                                                                                                    | Notes                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Safe sample temperature                 | **2–8 °C**                                                                                                                                                                                | One constant in `src/config/telemetry.ts`; may move per-drone into Supabase later                        |
| ThingSpeak channels                     | **Private**                                                                                                                                                                               | Per-channel read keys via a `VITE_THINGSPEAK_READ_KEYS` JSON map (Phase 3) until an Edge Function exists |
| Drone list when Supabase is unavailable | **Fall back to static `src/config/drones.ts`**                                                                                                                                            | UI must clearly say Supabase failed (`DroneListSourceBanner`, already built)                             |
| Restrict sign-up to `@duke.edu`         | **Not now**                                                                                                                                                                               | Possible later item                                                                                      |
| Drone `id` type                         | Text slug (e.g. `blue-devil-1`)                                                                                                                                                           | Readable URLs, matches the mock ids; enforced by a check constraint                                      |
| How clinic accounts are created         | Google sign-in, or Supabase dashboard → Add user                                                                                                                                          | No self-service sign-up form in the app (could add later)                                                |
| New user default role                   | `patient`                                                                                                                                                                                 | Clinic role granted manually by an admin via SQL; users cannot change their own role                     |
| Git                                     | **User reviews and commits**                                                                                                                                                              | Claude never commits                                                                                     |
| Stack                                   | Vite 8, React 19, TS 6 (strict), React Router 8, Tailwind 4 + shadcn/ui (radix-nova), TanStack Query 5, react-leaflet 5, Recharts 3, Supabase JS 2, Zod 4, Vitest 5, ESLint 10 + Prettier | As specified by the user; versions are whatever npm resolved                                             |

## Phase 1: scaffold, UI, mock telemetry ✅ Complete

- [x] Vite + React + TS strict scaffold; ESLint (flat config) + Prettier; Vitest + RTL
- [x] Tailwind v4 + shadcn/ui components (button, card, badge, table, skeleton, alert, input, label, dropdown-menu, avatar, separator, sidebar, sheet, tooltip)
- [x] Domain types in `src/types/` (`Drone`, `DroneList`, `TelemetryPoint`, `DroneStatus`, `LatLng`)
- [x] Config: `telemetry.ts` (temp range, thresholds, stale cutoff, poll interval, history window), `clinic.ts` (Duke Hospital home base), `env.ts` (Zod-validated env)
- [x] `TelemetryProvider` interface + `MockTelemetryProvider` (4 drones, deterministic clock-based simulation, 15 s sample grid, temperature excursions, one offline drone)
- [x] Hooks: `useDrones`, `useDroneTelemetry`, `useAllDronesTelemetry`, `useDroneHistory` (TanStack Query, 5 s polling)
- [x] Status derivation (`deriveStatus`, `isStale`) and temperature alerts (`getTemperatureAlert`)
- [x] App shell: collapsible sidebar (Dashboard, Drones; Missions, Patients, Settings marked "Soon"), top bar with mock-data badge and user menu + logout
- [x] `/dashboard`: summary cards + fleet map with status-colored markers, popups, legend, freshness line
- [x] `/drones`: table with status, temperature, battery, last updated / stale indicator; clickable rows
- [x] `/drones/:droneId`: header, alert banner, stat cards, follow-map with breadcrumb trail, temperature chart with shaded safe band
- [x] `/login` portal UI (form disabled until Phase 2), 404 page, route error page
- [x] Stale indicators, loading skeletons, friendly error states
- [x] Dev-only auth bypass (`VITE_AUTH_BYPASS=true`) behind `AuthProvider` / `useAuth`
- [x] `.env.example`, README (setup, mock mode, field mapping, security note)
- [x] Tests: status derivation, temperature alerts, mock provider, drones page render
- [ ] **Visual check in a browser by the user** (Claude couldn't open a browser in the Phase 1 session)

## Phase 2: Supabase auth, roles, guards ✅ Complete

- [x] Add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to `env.ts` and `.env.example` (empty values are treated as unset)
- [x] `src/lib/supabase.ts` client (null when not configured, so the app still runs)
- [x] Migration `supabase/migrations/20261021120000_init.sql`:
  - [x] `profiles` (id → auth.users, display_name, `role` enum 'clinic' | 'patient', default 'patient')
  - [x] Trigger: create a profile on sign-up, plus a backfill for users who already exist
  - [x] `drones` (text slug id, name, thingspeak_channel_id, home_base_lat/lng defaulting to Duke Hospital, created_at)
  - [x] RLS: users read only their own profile; no client insert/update/delete on profiles or drones; `is_clinic()` security-definer helper; only clinic users can read `drones`
- [x] `AuthProvider` picks `BYPASS_AUTH` or `SupabaseAuthProvider`. The Supabase one handles the session (`onAuthStateChange`), profile/role (TanStack Query + Zod), `signInWithPassword`, `signInWithGoogle(returnTo)`, and `signOut` (which also clears the query cache)
- [x] `ClinicLoginForm` wired up: errors, loading spinners, disabled when Supabase isn't configured or the bypass is on, shows Google OAuth errors from the URL
- [x] Route guards: `RequireAuth` (→ `/login?next=…`) and `RequireRole role="clinic"` (→ `NoAccess`, which offers sign-out and explains a profile-load failure)
- [x] `/login` redirects signed-in users to `next`, validated by `safeNextPath` to block off-site redirects
- [x] Tests: route guards (loading, signed out, patient, profile error, clinic, bypass), login page (redirect, password sign-in, error, Google, not configured), `safeNextPath`
- [x] README: Supabase setup (migration, URL config, Google OAuth, adding users, granting the clinic role, turning off the bypass)
- [x] Verified `build` / `lint` / `test` pass (34 tests)
- [x] **User:** run the migration in the Supabase SQL Editor
- [x] **User:** set the Site URL and Redirect URLs in Supabase (see README)
- [x] **User:** set up the Google OAuth client and enable the Google provider in Supabase
- [x] **User:** create an account, grant it `role = 'clinic'`, set `VITE_AUTH_BYPASS=false`, and test signing in for real

## Deployment: Vercel ✅ Complete

The app is a static SPA (`npm run build` → `dist/`). The deployed site uses mock
telemetry until the ThingSpeak read keys move server-side, and always requires a real Supabase sign-in (the auth
bypass only works in `npm run dev`). Full steps are in the README under
"Deploying to Vercel".

- [x] `vercel.json` rewrites every path to `index.html`, so deep links, page refreshes and the Google sign-in return to `/login?next=…` don't 404
- [x] **User:** commit and push (including `vercel.json`)
- [x] **User:** create the Vercel project from the repo (Framework preset: Vite; build `npm run build`; output `dist`)
- [x] **User:** add env vars in Vercel **before the first build**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TELEMETRY_SOURCE=mock`. Never the service_role key. Values are baked in at build time, so redeploy after changing any of them
- [x] **User:** in Supabase → Authentication → URL Configuration, set the Site URL to the production URL and add `https://<production-domain>/**` to Redirect URLs (keep `http://localhost:5173/**`)
- [ ] **User (optional):** add `https://*-<vercel-team>.vercel.app/**` to Redirect URLs so sign-in works on preview deploys
- [x] **User:** if the Google OAuth consent screen is in "Testing" mode, add clinic testers as test users (or publish the app)
- [x] **User:** smoke-test production: refresh on `/drones/<id>` (no 404), password sign-in, Google sign-in, a patient account sees "No access", sign-out
- [ ] Optional: long-lived cache headers for `/assets/*` and basic security headers in `vercel.json`
- [ ] **Before switching the deployed site to `thingspeak`:** move the read keys into a Supabase Edge Function. `VITE_` vars are public, and GPS history reveals patients' home locations

## Phase 3: ThingSpeak provider ⏳ Code done, waiting on user steps

Work is on the `thingspeak` branch.

- [x] `src/config/thingspeakFields.ts`: field1 temp °C, field2 lat, field3 lng, field4 speed m/s, field5 battery %, clearly marked as the hardware contract
- [x] Zod schema for ThingSpeak feed responses (`thingspeak/thingspeakSchema.ts`): string fields → numbers, missing/garbage → null, `0,0` → no GPS fix, entries without a valid timestamp skipped, `-1` body → "channel not found or bad read key" error
- [x] `ThingSpeakTelemetryProvider`: `getLatest` (`/feeds.json?results=1`), `getHistory` (`/feeds.json?minutes=`), per-channel read keys from `VITE_THINGSPEAK_READ_KEYS` (Zod-validated JSON map in `env.ts`), 10 s request timeout, readable errors
  - Decision: use `/feeds.json?results=1` instead of `/feeds/last.json`, because `last.json` answers `-1` for both an empty channel and a wrong key
- [x] Drone list (`thingspeak/loadDroneList.ts`): Supabase `drones` table → fall back to `src/config/drones.ts` with `fallbackReason`. Also falls back when there is no Supabase session (dev bypass), because RLS would silently return zero rows
- [x] `createTelemetryProvider` switch on `VITE_TELEMETRY_SOURCE`
- [x] Tests: Zod parsing of a sample ThingSpeak response (incl. missing/garbage fields), the provider with a fake `fetch`, the drone-list fallback (50 tests total)
- [x] README: pointing at a real channel, troubleshooting, and the plan for moving the read keys to an Edge Function
- [x] `.env.example`: `VITE_THINGSPEAK_READ_KEYS` with a "local only" warning
- [x] Verified `build` / `lint` / `test` pass and `dev` starts
- [ ] **User:** fill in the real channel ids in `src/config/drones.ts` (fallback list; currently one placeholder drone with no channel)
- [ ] **User:** insert one `public.drones` row per drone in the Supabase SQL Editor (see README)
- [ ] **User:** in `.env.local`, set `VITE_TELEMETRY_SOURCE=thingspeak`, `VITE_AUTH_BYPASS=false` and `VITE_THINGSPEAK_READ_KEYS` (private channels only), restart `npm run dev`, sign in as clinic
- [ ] **User:** check with live hardware data: positions on the map, temperature chart, status changes, stale/offline when the carrier stops uploading
- [ ] **User:** keep Vercel on `VITE_TELEMETRY_SOURCE=mock` and do not add `VITE_THINGSPEAK_READ_KEYS` there (see Deployment)

## Later / out of scope for now

- Move ThingSpeak reads (and keys) into a Supabase Edge Function before real deployment
- Duke SSO behind the existing `AuthProvider` interface (add a provider producing `AuthContextValue`)
- Optional: email/password sign-up and password-reset screens (accounts are created in the Supabase dashboard for now)
- Optional: a way for admins to grant the clinic role from the UI (SQL only for now)
- Optional: restrict clinic sign-up to `@duke.edu`
- Patient-facing side (patient login, pickup tracking); the `patient` role and disabled login card are the hooks for it
- Missions, Patients and Settings pages
- Per-drone or per-sample-type temperature ranges (move the range into Supabase)
- Dark mode (the app is light-only; status colors are hex constants in `features/drones/statusStyles.ts`)
