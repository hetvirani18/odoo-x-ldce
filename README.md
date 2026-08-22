# GlobeTrotter

A full-stack trip planner built for the Odoo hackathon: plan multi-city trips, build day-by-day
itineraries, discover activities per destination, track budgets, and share a read-only public
itinerary link.

## Stack

- **Backend** — Express + plain JavaScript (no TypeScript), MySQL via `mysql2`, JWT auth
  (httpOnly cookie), Zod validation, `bcryptjs`, `axios` for external providers.
- **Frontend** — Vite + React 19 + React Router, Redux Toolkit (RTK Query) for all state,
  Tailwind v4, `react-hook-form` + Zod, `motion` for animation.
- **External data providers** (optional, fall back to seeded data if unset): GeoDB/GeoNames
  (city search), OpenTripMap (real activities + photos), a flight-fare API for pricing.

## Project layout

```
backend/        Express API server (src/models, repositories, controllers, routes, services)
frontend/       The real app — wires ui-design's screens to the backend
ui-design/      Static UI prototype (no backend/router) — the design system frontend/ builds from
docs/           Architecture & style guides for backend and frontend, DB schema
```

See `docs/backend-architecture.md` and `docs/frontend-architecture.md` for full endpoint/screen
maps, `docs/BACKEND_GUIDE.md` / `docs/FRONTEND_GUIDE.md` for code conventions, and
`docs/database-design.md` for the schema rationale.

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DB credentials at minimum
```

Create the database and load the schema (+ optional seed data):

```bash
mysql -u root -p -e "CREATE DATABASE globetrotter"
mysql -u root -p globetrotter < src/database/schema.sql
mysql -u root -p globetrotter < src/database/seed.sql
```

Run it:

```bash
npm run dev     # nodemon, http://localhost:4000
```

External API keys (`GEODB_API_KEY`, `OPENTRIPMAP_API_KEY`, `FLIGHTFARE_API_KEY`) are optional —
without them, city/activity search falls back to the seeded dataset. `SMTP_*` is required only
for the forgot-password email flow.

### Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

The frontend expects the backend at the URL configured in its Vite/env setup, and the backend's
`CORS_ORIGIN`/`FRONTEND_URL` should point back at `http://localhost:5173` for local dev.

## Core features

- Auth (signup/login/logout, forgot/reset password) via JWT httpOnly cookie
- Trip CRUD with multi-city stops and date ranges
- Itinerary builder: search destination cities, add stops, schedule activities per stop
- Per-city activity discovery (seeded + live provider data)
- Budget estimation per trip
- Public read-only itinerary sharing via share token
- Admin dashboard (platform stats, user/role management)
