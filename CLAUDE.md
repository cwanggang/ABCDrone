# CLAUDE.md

## Project plan and progress: read `plan.md` first

**`plan.md` describes the flow and progress of this project**: the phases, the
decisions already made, what is implemented, and what is still to do. Read it at
the start of every session before doing anything else. **Keep it updated as you
work:** tick off items when finished, add new tasks or decisions as they come up,
and refresh the "Last updated" line.

## What this is

The clinic-facing web app for the Duke EGR 101 ABCDrone project: clinic staff
monitor sample-carrying drones (position, status, sample temperature) live. A
student team maintains it, so **readability matters more than cleverness**: keep
components small, and explain non-obvious decisions in short comments or the README.

## Commands

```bash
npm run dev      # dev server, http://localhost:5173
npm run build    # tsc -b + vite build
npm run lint     # eslint
npm test         # vitest run
npm run format   # prettier --write .
```

All four of `dev`, `build`, `lint` and `test` must pass at the end of every phase.
Run `npm run format` before finishing.

## How to work in this repo

- Work phase by phase as laid out in `plan.md`. **Stop after each phase** so the user can run it.
- **Never commit or push.** The user reviews and commits git changes themselves.
- Ask before changing the stack (see `plan.md` → Decisions).

## Architecture rules

- **Telemetry:** components never call a `TelemetryProvider`, ThingSpeak or the mock
  directly. Use the hooks in `src/features/telemetry/` (`useDrones`,
  `useDroneTelemetry`, `useAllDronesTelemetry`, `useDroneHistory`). The provider is
  picked by `VITE_TELEMETRY_SOURCE` in `createTelemetryProvider.ts`.
- **Status is derived, never stored** (`deriveStatus.ts`). Thresholds, the safe
  temperature range, the stale cutoff and the poll interval all live in `src/config/telemetry.ts`.
- **Env vars** are read only through `src/config/env.ts` (Zod-validated). Every
  `VITE_` var is public in the browser, so never treat one as a secret.
- **Auth** goes through `AuthProvider` / `useAuth` (`src/features/auth/`). Keep that
  interface provider-agnostic so Duke SSO can be added later. `VITE_AUTH_BYPASS` only works in dev.
- **Fast refresh lint:** a `.tsx` file should only export components. Put contexts,
  constants and hooks in separate `.ts` files (see `AuthContext.ts` / `useAuth.ts`).
- **Access control** has two layers: route guards in the browser (`RequireAuth`,
  `RequireRole`) for UX, and Supabase row-level security
  (`supabase/migrations/`) for real enforcement. Any new table needs RLS policies.
  Schema changes go in a new migration file; never edit one that has already been applied.
- In tests, provide auth with `<AuthContext value={fakeAuth({...})}>` (`src/test/fakeAuth.ts`)
  and telemetry with `<TelemetryContextProvider provider={new MockTelemetryProvider({ latencyMs: 0 })}>`.
- Show a `StaleIndicator` wherever telemetry is displayed; use skeletons and
  `ErrorState` instead of blank screens.
- Status colors live in `src/features/drones/statusStyles.ts`. Always pair a color with a label or icon.

## Gotchas

- Library versions are newer than older docs: React Router 8 (import from
  `react-router`), Vite 8, Vitest 5, TypeScript 6 (`baseUrl` is deprecated; use
  `paths` only), Zod 4, ESLint 10 flat config.
- `src/hooks/use-mobile.ts` was hand-edited to pass the React hooks lint rules.
  Re-adding the shadcn `sidebar` component overwrites it.
- Leaflet maps use `CircleMarker`s, not default pin icons (those break under Vite).
  `BaseMap` wraps maps in `isolate` so Leaflet's z-indexes don't cover menus.
- TanStack Query keeps the last `data` when a refetch fails (`isError` becomes true),
  so check `data !== undefined`, not `isSuccess`, and mark the data stale.
