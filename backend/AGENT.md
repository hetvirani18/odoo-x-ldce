# AGENT.md — backend/

Scoped guidance for working inside `backend/`. The root `AGENT.md` still applies (think before
coding, simplicity first, surgical changes, goal-driven execution) — this file only adds
backend-specific pointers so they don't have to be re-derived every time.

## Read these first

- `../docs/BACKEND_GUIDE.md` — the style bible. Layering (models → repositories → controllers →
  routes → services), the no-Result-pattern error convention (`throw AppError` + `asyncHandler`),
  response shapes, the provider-abstraction pattern for external APIs, the email-service pattern.
- `../docs/backend-architecture.md` — what actually gets built: every module, every endpoint,
  the error-code domains, the auth flow (including admin login — §3.8), the itinerary/budget data
  flow, the build order.
- `../docs/database-design.md` — ER diagram, table rationale, full DDL. `src/database/schema.sql`
  is the file actually run against MySQL; keep it in sync if the design doc changes (or vice versa).

## Quick facts (full detail lives in the docs above)

- Plain JavaScript, CommonJS (`require`/`module.exports`) — no TypeScript, no build step.
- MySQL via `mysql2`, `?` placeholders, no `RETURNING` (re-query by `insertId`), plural table names.
- No Result/`neverthrow` wrapper — `throw AppError`, caught by `asyncHandler` + `error.middleware.js`.
- Access token only, no refresh token — JWT set as an httpOnly cookie (`access_token`), read via
  `cookie-parser` in `auth.middleware.js`. Never put the token in a JSON response body.
- Admin is `users.role = 'admin'`, not a separate account system. Same `POST /api/auth/login` for
  everyone; only the *frontend* has a separate `/admin/login` page — don't add a duplicate backend
  login endpoint for admins.
- External data (cities, activities, pricing) always goes through a `services/*Provider/`
  interface + real implementation + seeded fallback — never call `axios` directly from a controller.
- Rate limiting (`express-rate-limit`) is global, registered first in `app.js`, before `cors`/`json`/`cookieParser`.
- No unnecessary comments — a block of comments stacked over a function reads like a paragraph
  and usually means the code should be clearer instead. One line max, only for genuine non-obvious
  *why* (see root `AGENT.md`).

## Before adding a new module

Check `docs/backend-architecture.md`'s Module Inventory (§3) and Build Order (§9) first — if the
endpoint isn't listed there, either it's genuinely new (update the doc too) or it's scope creep
the hackathon plan didn't call for (ask before building it).
