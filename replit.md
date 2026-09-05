# Massar (مسار)

Massar is a Jordanian intercity ride-sharing app that matches passengers with route-compatible captains and lets passengers reserve one or more seats.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/massar` — Expo mobile app for the passenger booking prototype
- `artifacts/api-server` — shared Express API foundation
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `Tawsileh_Architecture_Implementation_Plan.md` — original architecture and phased build plan

## Architecture decisions

- The first mobile milestone is a local-first matching proof, using AsyncStorage while the backend contract is developed.
- Massar supports booking 1–4 seats per request; matching must require available seats greater than or equal to requested seats.
- Prototype fare is calculated per reserved seat and displayed as an estimated total until captain acceptance.
- The mobile UI uses a single Expo codebase with passenger-focused tabs for Home, Trips, and Profile.

## Product

- Passengers can select Jerash → Amman, choose 1–4 seats, see a route-compatible captain, review the estimated total, confirm a ride request, and view saved trips.
- The app supports Arabic brand language and an English-first interface foundation with Massar/مسار identity.
- The adopted brand system uses the supplied Massar logo with deep navy, white, and road-orange accents. The primary slogan is “Your trip starts from here” / “توصلها بثقة”.

## User preferences

- Product name: Massar (مسار), replacing Tawsileh.
- Passenger booking must support more than one seat.

## Gotchas

- The current mobile milestone is a prototype with local persistence; live authentication, maps, matching API, captain acceptance, and notifications remain the next backend phases.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
