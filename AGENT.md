# AGENT.md

Behavioral guidelines for working on GlobeTrotter (Odoo hackathon project). Merge with
project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.
This is a hackathon on a tight clock — don't let caution become an excuse to over-plan instead of ship.

## 0. Project Structure

- `docs/` — all cross-cutting docs. Check here before assuming something isn't documented.
  - `PROJECT_PLAN.md` — problem statement summary, screens, tech stack, build order
  - `BACKEND_GUIDE.md` — backend code style bible (plain JavaScript, no TypeScript, no Result-pattern library; models/repositories/controllers/routes/services conventions, error system)
  - `backend-architecture.md` — what we build: full folder tree, every module/endpoint, error-code domains, external services, itinerary/budget data flow
  - `database-design.md` — ER diagram, table rationale, full MySQL DDL
  - `schema.sql` — the DDL actually run against the database (source of truth for table shape)
  - `GlobeTrotter.pdf` / `GlobeTrotter - 8 hours.png` — the original problem statement from Odoo
- `ref/` — reference material from a prior project (different stack: TypeScript + `neverthrow` +
  database-per-tenant, though also MySQL). Useful for **structural patterns** (layering, error
  catalogs, response shapes, doc-writing style) — **not** for literal stack choices on the
  TS/Result-pattern/multi-tenancy front. GlobeTrotter uses plain JavaScript, no Result-pattern
  wrapper, and a single-tenant MySQL database — see `docs/BACKEND_GUIDE.md` for the actual rules
  that apply here.
- `backend/` (to be scaffolded) — Express + plain JavaScript API server, per `docs/BACKEND_GUIDE.md`.
- `frontend/` (to be scaffolded) — not yet decided/built.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked, and beyond what `docs/PROJECT_PLAN.md` scopes as must-have.
- No abstractions for single-use code — except the provider abstraction pattern in
  `docs/BACKEND_GUIDE.md` §9 (city/activity/pricing services), which is deliberate: external APIs
  in this project are genuinely swappable/unreliable, so that one abstraction is justified.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Handle invalid inputs, then verify with a quick manual/curl check"
- "Fix the bug" → "Reproduce it, then verify it's gone"
- "Refactor X" → "Confirm behavior is unchanged before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Given the hackathon timeline, a full test suite is out of scope (see
`docs/backend-architecture.md` §8) — verification means a quick manual/curl round-trip, not
comprehensive automated coverage.

## 5. Stack Reminders (specific to this project)

- **JavaScript, not TypeScript.** No build step, no `.ts` files.
- **No Result-pattern library (`neverthrow` or similar).** Plain `async/await`, `throw AppError`,
  caught by `asyncHandler` + centralized error middleware. See `docs/BACKEND_GUIDE.md` §3.
- **MySQL** (via `mysql2`), not PostgreSQL — `?` placeholders, no `RETURNING` clause (re-query by
  `insertId` instead), table names are plural (`users`, `trips`, ...).
- **Single-tenant.** No database-per-user, no tenant pool routing — ownership is just
  `trip.user_id`, checked in the controller. (Multi-tenancy — one physical database per customer
  organization — is a `ref/` SecurePass pattern for a B2B product with isolated business
  customers; GlobeTrotter is a single consumer app with no equivalent, so it doesn't apply here.)
- **Access token only, no refresh token.** JWT set by the backend as an httpOnly cookie on
  signup/login, read by `authenticate` middleware — never returned in the JSON body, never
  handled/stored by the frontend. See `docs/BACKEND_GUIDE.md` §11.
- External data (cities, activities, pricing) always goes through the provider abstraction in
  `docs/BACKEND_GUIDE.md` §9 — never call `axios` directly from a controller.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to
overcomplication, and clarifying questions come before implementation rather than after mistakes.
