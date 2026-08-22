# AGENT.md — frontend/

Scoped guidance for working inside `frontend/`. The root `AGENT.md` still applies (think before
coding, simplicity first, surgical changes, goal-driven execution) — this file only adds
frontend-specific pointers so they don't have to be re-derived every time.

## Read these first

- `../docs/FRONTEND_GUIDE.md` — the style bible. Architecture flow (UI → RTK Query hooks → api
  slice → REST API), why Redux Toolkit/RTK Query instead of TanStack Query + Context, folder
  structure, the `app/api.js` conventions, Zod + react-hook-form patterns, routing, styling rules,
  the "what NOT to do" list (§11).
- `../docs/frontend-architecture.md` — what actually gets built: the full route table (every
  screen → route → backend endpoint), the three open gaps (Community list endpoint, admin
  analytics scope, landing page regional cards) that must be resolved before wiring those specific
  screens, the folder tree, and the build order.
- `../ui-design/` — the design system. Not thrown away — its `index.css`, `components/{ui,icons,
  cards,charts}.jsx`, and `screens/*.jsx` are the starting point every page/component in here is
  ported from. Don't redesign while wiring; see `FRONTEND_GUIDE.md` §0.

## Quick facts (full detail lives in the docs above)

- Plain JavaScript, Vite + React Router (`react-router`, not `react-router-dom`) — no TypeScript,
  no Next.js/file-based routing.
- **Redux Toolkit (RTK Query) for all state** — server data and UI state both. No TanStack Query,
  no separate auth Context. "Am I logged in" is `useGetMeQuery()` succeeding — nothing else.
- **No client-managed auth token.** The backend sets an httpOnly `access_token` cookie
  (`backend-architecture.md` §4). Every `fetchBaseQuery` call uses `credentials: 'include'`. Never
  add `localStorage`/`Authorization` header token-reading code — there is nothing to read.
- One `createApi()` in `app/api.js`; every feature injects its own endpoints via
  `api.injectEndpoints()` — never call `createApi()` again.
- Zod schemas live in each feature's `schemas.js`; a shape used by 2+ features graduates to
  `lib/schemas.js`. `resolver: zodResolver(schema)` on every non-trivial form.
- A Redux slice only exists for state with no backend endpoint (a wizard step, sidebar open/closed)
  — never a copy of server data RTK Query already caches.
- No unnecessary comments — same rule as the backend and root guides. One line max, only for
  genuine non-obvious *why*.

## Before wiring a new screen

Check `docs/frontend-architecture.md`'s route table (§2) for the route and backend endpoint(s) it
maps to. If the screen is one of the three flagged **Known Gaps** (§3 — Community listing, admin
analytics charts, landing page regional cards), don't invent an endpoint or guess a shape — the
gap doc lists the options; confirm the choice (with the user, or by checking if it's already been
decided) before building against it.
