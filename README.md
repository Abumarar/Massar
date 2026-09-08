# Massar (مسار)

Massar is a Jordanian intercity ride-sharing app that connects passengers with route-compatible drivers for trips such as **Jerash ↔ Amman**.

> **Your trip starts from here** · **توصلها بثقة**

## What is included

- Passenger mobile experience built with Expo and React Native
- Jerash ↔ Amman route matching prototype
- Bookings for 1–4 seats with rider-defined fare settings
- English and Arabic language switching
- Driver onboarding flow with vehicle details and compliance document checklist
- Massar Operations web console for:
  - Driver application review
  - Document approval and rejection
  - Driver status management
  - Ride operations monitoring
  - Compliance requirements
  - Operations activity feed
- Shared Express API with PostgreSQL, Drizzle ORM, OpenAPI, and generated React Query/Zod clients

## Product surfaces

| Surface | Location | Purpose |
| --- | --- | --- |
| Massar mobile app | `artifacts/massar` | Passenger booking and driver onboarding |
| Massar Operations | `artifacts/massar-operations` | Internal driver, document, and ride operations |
| API server | `artifacts/api-server` | Shared API and operations data |

## Technology

- pnpm workspaces
- Node.js and TypeScript
- Expo / React Native
- React and Vite
- Express 5
- PostgreSQL and Drizzle ORM
- Zod and OpenAPI-generated clients
- TanStack React Query

## Getting started

Install dependencies with pnpm:

```bash
pnpm install
```

The API requires a PostgreSQL connection:

```bash
DATABASE_URL=your-development-database-url
```

Run the full workspace checks:

```bash
pnpm run typecheck
pnpm run build
```

Run individual development surfaces:

```bash
# API server
pnpm --filter @workspace/api-server run dev

# Expo mobile app
pnpm --filter @workspace/massar run dev

# Operations console
pnpm --filter @workspace/massar-operations run dev
```

For local database schema updates during development:

```bash
pnpm --filter @workspace/db run push
```

Do not run database schema pushes against production without reviewing the migration and deployment plan.

## API contract

The API contract lives in `lib/api-spec/openapi.yaml`. When the contract changes, regenerate the typed clients:

```bash
pnpm --filter @workspace/api-spec run codegen
```

The generated clients are used by both the mobile and operations applications.

## Compliance and document handling

The driver checklist is a configurable, source-labeled operational review workflow. It includes driver licence, national ID, vehicle registration, compulsory insurance, vehicle inspection, LTRC-related authorization, and additional passenger insurance where applicable.

The checklist is not a legal approval or a substitute for confirmation from the relevant Jordanian authorities. Requirements can change and should be reviewed before production onboarding.

The current MVP accepts document attachment metadata from the mobile flow. Before real driver onboarding, add private persistent object storage, authentication, and per-document access controls for uploaded identity and vehicle documents.

## Repository structure

```text
artifacts/
  api-server/          Express API
  massar/              Expo mobile application
  massar-operations/   Operations web console
lib/
  api-spec/            OpenAPI source contract
  api-client-react/    Generated React Query client
  api-zod/             Generated Zod schemas
  db/                  Drizzle schema and database package
```

## License

Massar is released under the [MIT License](./LICENSE).