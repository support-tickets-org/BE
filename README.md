# Support Tickets API

REST API built with Express 5, TypeScript and PostgreSQL.

## Setup

Requirements: Node 20+, Docker.

### Docker

```bash
docker compose up -d --build
```

- API: `http://localhost:4000/api/tickets`
- Postgres: `localhost:5434`

### Local development

```bash
docker compose up -d db
cp .env.example .env
npm install
npm run dev
```

The `tickets` table is created on startup.

### Tests

```bash
docker compose up -d db
npm test
```

Tests use the `tickets_test` database.

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Type-check |
| `npm test` | Run tests |

## API

| Method | Path | Success | Errors |
|---|---|---|---|
| `GET` | `/api/tickets?status=&q=&page=&limit=` | `200 { data, total, page, limit }` | `400` |
| `POST` | `/api/tickets` | `201` | `400` |
| `PATCH` | `/api/tickets/:id` | `200` | `400`, `404` |
| `DELETE` | `/api/tickets/:id` | `204` | `400`, `404` |

- Create: `title` (required, 3–100), `description` (optional, max 1000), `priority` (`low` | `medium` | `high`).
- Update: any of `title`, `description`, `priority`, `status` (`open` | `in_progress` | `closed`). At least one field is required.
- Query: `page` defaults to 1. `limit` defaults to 10, max 50. `q` searches the title, case-insensitive.
- Error format: `{ "error": { "message": "...", "details": { "field": ["..."] } } }`. `details` is only included for validation errors.

## Project Structure

```
src/
├── server.ts
├── app.ts                 wires dependencies
├── config/
├── db/                    pool, migration runner, SQL migrations
├── middlewares/           validate, notFound, errorHandler
├── utils/
└── modules/tickets/       routes, controller, service, repository, validation, types
tests/
└── tickets.test.ts        integration tests
```

## Decisions

- **PostgreSQL** for storage. Filtering, search and pagination run in SQL, and data persists across restarts.
- **`pg` with raw SQL**, no ORM. One table does not need one.
- **zod** for validation. The schemas also provide the TypeScript types.
- **Layered module with dependency injection** using factory functions. `createApp({ db })` wires everything, so tests can pass a test database.
- **Express 5**, which handles errors from async handlers without a wrapper.
- **Centralized error handler.** Unexpected errors are logged and returned as a generic `500` without a stack trace.
- **`limit` is capped at 50**, not rejected.
- **Search escapes `%` and `_`** so they match literally.
- **Migrations are idempotent SQL files** run on startup.

## Trade-offs

- The list endpoint runs two queries (count and page).
- Offset pagination is slower on large tables and can shift if data changes between pages.
- `ILIKE '%q%'` does not use an index.
- No migration history table, so migrations must stay idempotent.
- Integration tests require Docker for Postgres.
- Both TypeScript and Docker are used, although the task suggests one bonus.

## With More Time

- Auth with roles (agent and viewer).
- Shared types package for the API and UI.
- Migration tool with up/down migrations.
- Full-text search or a `pg_trgm` index.
- Cursor pagination, sorting, priority filter.
- Logging, rate limiting and security headers.
- OpenAPI docs.
- CI for typecheck and tests.
