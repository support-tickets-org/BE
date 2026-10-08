# Support Tickets API

REST API for a small ticket-tracking app, built with **Express 5 + TypeScript + PostgreSQL**.

## Setup

**Requirements:** Node 20+, Docker.

### Run everything in Docker

```bash
docker compose up -d --build
```

API: `http://localhost:4000/api/tickets`. Postgres is exposed on host port **5434** (to avoid clashing with a local Postgres on 5432).

### Run locally (for development)

```bash
docker compose up -d db      # Postgres only
cp .env.example .env
npm install
npm run dev                  # http://localhost:4000, reloads on change
```

The `tickets` table is created automatically on startup.

### Tests

```bash
docker compose up -d db      # tests use the tickets_test database
npm test
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start with hot reload (tsx) |
| `npm run build` / `npm start` | Compile to `dist/` and run it |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run all tests (Vitest) |

## API

| Method | Path | Success | Errors |
|---|---|---|---|
| `GET` | `/api/tickets?status=&q=&page=&limit=` | `200 { data, total, page, limit }` | `400` |
| `POST` | `/api/tickets` | `201` created ticket | `400` |
| `PATCH` | `/api/tickets/:id` | `200` updated ticket | `400`, `404` |
| `DELETE` | `/api/tickets/:id` | `204` | `400`, `404` |

- **Create body:** `title` (required, 3–100 chars), `description` (optional, max 1000), `priority` (`low` \| `medium` \| `high`).
- **Patch body:** any of `title`, `description`, `priority`, `status` (`open` \| `in_progress` \| `closed`); at least one is required.
- **Query:** `page` defaults to 1, `limit` defaults to 10 and is capped at 50. `q` is a case-insensitive title search.
- **Errors** always look like `{ "error": { "message": "...", "details": { "field": ["..."] } } }`. `details` is only present for validation errors.

## Project Structure

```
src/
├── server.ts              entry point: config, pool, migrations, listen
├── app.ts                 createApp(): wires all dependencies (composition root)
├── config/                environment variables
├── db/                    pool factory, migration runner, SQL migrations
├── routes/                mounts module routers under /api
├── middlewares/           validate (400), notFound (404), errorHandler
├── utils/HttpError.ts
└── modules/tickets/       routes → controller → service → repository (+ validation, types)
tests/
├── tickets.test.ts        integration tests (Supertest + real Postgres)
└── ticket.service.test.ts unit tests with a fake repository
```

## Decisions

- **PostgreSQL** instead of in-memory or a JSON file. It's what a real ticket system would use, it handles filtering, search and pagination in SQL, and data survives restarts. Docker Compose makes it a one-command setup.
- **Raw SQL with `pg`**, no ORM. One table and four queries don't need an ORM, and the filter/pagination logic stays explicit and easy to review.
- **zod for validation.** One schema gives both the runtime check and the TypeScript type (`z.infer`), so the two can't drift apart. Unknown fields are rejected (`.strict()`).
- **Layered module** (routes → controller → service → repository) with **dependency injection** through plain factory functions, no DI library. `createApp({ db })` is the only place where dependencies are wired, so tests can pass a test database or a fake repository.
- **Express 5.** It forwards errors from async handlers to the error handler, so no `asyncHandler` wrapper is needed.
- **Centralized error handling.** Known errors (`HttpError`, malformed JSON) return their status and message. Anything unexpected is logged on the server and returned as a generic `500`, so stack traces never reach the client.
- **`limit` is capped, not rejected.** The spec says "cap limit at 50", so `limit=500` returns 50 results.
- **Search escapes `%` and `_`,** so searching for "50%" matches that text literally instead of acting as a wildcard.
- **Migrations are idempotent SQL files** (`IF NOT EXISTS`) run on startup, which avoids a migration tool for a single table.

## Trade-offs

- **Two queries per list request** (count + page). Simple and clear. A window function (`COUNT(*) OVER()`) would save a round trip but makes the query harder to read.
- **Offset pagination.** Easy to use from a UI with page numbers, but it gets slower on very large tables and can skip or repeat rows if data changes between pages.
- **`ILIKE '%q%'` search** can't use a normal index, which is fine at this size but won't scale to millions of rows.
- **No migration history table.** Fine for additive, idempotent migrations, not for schema changes that must run exactly once.
- **Integration tests need Docker** because they use a real Postgres. That's slower than mocks but proves the SQL actually works. The service unit tests run without a database.
- **TypeScript and Docker are both included**, although the task suggests at most one bonus. Docker is mainly here as the simplest way to run Postgres.

## With More Time

- Auth with roles (agent can edit, viewer is read-only).
- Share types with the frontend through a package instead of copying them.
- A proper migration tool (e.g. node-pg-migrate) with up/down migrations.
- Full-text search or a `pg_trgm` index for the title search.
- Cursor-based pagination, sorting options, and filtering by priority.
- Request logging (pino), rate limiting, CORS and security headers (helmet).
- OpenAPI docs generated from the zod schemas.
- CI pipeline running typecheck and tests against a Postgres service.
