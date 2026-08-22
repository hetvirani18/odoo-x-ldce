# GlobeTrotter Frontend — Architecture

> Companion to **`FRONTEND_GUIDE.md`** (the style bible — layering rules, RTK Query conventions,
> Zod/react-hook-form patterns, routing, styling). That guide defines **how** code is written;
> this document defines **what** we build: the full folder tree, every page/route, which backend
> endpoint each screen calls, and known gaps between the `ui-design/` prototype and what
> `backend-architecture.md` currently exposes.

---

## 1. Stack (as mandated by FRONTEND_GUIDE.md)

Vite + React, **plain JavaScript** (no TypeScript) · `react-router` (client-side, no SSR) ·
`@reduxjs/toolkit` + `react-redux` (RTK Query for all server state, plain slices for UI-only
state — no TanStack Query, no separate auth Context) · `zod` (form + selective response
validation) · `react-hook-form` + `@hookform/resolvers` · `motion` · Tailwind v4 (`@tailwindcss/vite`),
tokens and components carried over from `ui-design/`.

Auth: no client-managed token at all — the backend's `access_token` is an httpOnly cookie
(`backend-architecture.md` §4). Every `fetchBaseQuery` call goes out with `credentials: 'include'`;
"logged in" is just `useGetMeQuery()` succeeding.

---

## 2. Route Table — 12 screens → real pages → real endpoints

Each row: the `ui-design/` prototype screen it's built from, the real route, and the backend
endpoint(s) that replace its mock data (`docs/backend-architecture.md` §3 has full request/response
shape per endpoint).

| # | `ui-design/` screen | Route | Layout | Backend endpoint(s) |
|---|---|---|---|---|
| 1 | LoginScreen | `/login` | AuthLayout | `POST /api/auth/login` |
| 2 | RegisterScreen | `/register` | AuthLayout | `POST /api/auth/signup` |
| — | *(new — not a numbered wireframe, but required by §3.1)* | `/forgot-password`, `/reset-password` | AuthLayout | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| 3 | LandingScreen | `/` | AppLayout | `GET /api/trips` (Previous trips), city catalog for regional cards — see Gap 3 below |
| 4 | CreateTripScreen | `/trips/new` | AppLayout | `POST /api/trips` |
| 5 | BuildItineraryScreen | `/trips/:tripId/build` | AppLayout | `POST /api/trips/:tripId/stops`, `POST /api/stops/:id/activities`, `PUT /api/trips/:tripId/stops/reorder` |
| 6 | TripListingScreen | `/trips` | AppLayout | `GET /api/trips` (grouped client-side into Ongoing/Upcoming/Completed by comparing `start_date`/`end_date` to today — no separate endpoint per group) |
| 7 | ProfileScreen | `/profile` | AppLayout | `GET /api/users/me`, `PUT /api/users/me`, `POST /api/users/me/photo` |
| 8 | ActivitySearchScreen | `/search` | AppLayout | `GET /api/cities/search?q=`, `GET /api/cities/:cityId/activities` |
| 9 | ItineraryBudgetScreen | `/trips/:tripId` | AppLayout | `GET /api/trips/:id`, `GET /api/trips/:id/budget`; Share panel → `PUT /api/trips/:id` (`is_public`) + reads back `share_token` |
| 10 | CommunityScreen | `/community` | AppLayout | **Gap — see Gap 1 below.** No "list public trips" endpoint exists yet. |
| 11 | CalendarScreen | `/calendar` | AppLayout | `GET /api/trips`, rendered into a month grid client-side — no dedicated calendar endpoint needed |
| — | *(public itinerary — implied by Screen 9's Share panel, not its own numbered wireframe)* | `/t/:shareToken` | none (bare page, no chrome) | `GET /api/public/trips/:shareToken` |
| 12 | AdminScreen | `/admin/users`, `/admin/stats` | AdminLayout | `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `GET /api/admin/stats` — **see Gap 2**, two of the four `ui-design/` admin tabs don't map to this endpoint as scoped |
| — | *(admin sign-in — `backend-architecture.md` §3.9 calls for a dedicated frontend entry point)* | `/admin/login` | AuthLayout (or its own minimal layout) | `POST /api/auth/login` — same endpoint as traveler login, role comes back in the JWT |

---

## 3. Known Gaps — decide before wiring, don't silently invent an endpoint

These surfaced while mapping `ui-design/`'s mock screens onto the actual backend contract. Flagging
them now (matching `AGENT.md` §1's "don't hide confusion, surface tradeoffs") rather than having
the frontend build stall on a missing endpoint later.

### Gap 1 — Community page has no backing "list" endpoint

`backend-architecture.md` §3.8 defines exactly one public-share endpoint:
`GET /api/public/trips/:shareToken` — fetch **one** trip by its token. There is no
`GET /api/public/trips` (or similar) that returns *all* currently-public trips, which is what a
"browse shared itineraries" directory (the `ui-design/` Community screen, already scoped down once
to drop the fabricated likes/comments — see that screen's history) needs.

**Options, pick one before building `/community`:**
- **(a)** Add `GET /api/trips/public?limit=&cursor=` to `backend-architecture.md` §3 — a new
  repository query filtering `WHERE is_public = true`, paginated. Smallest real addition, matches
  the existing `is_public`/`share_token` model.
- **(b)** Cut the directory entirely — Community becomes just "paste a share link to view a trip"
  (`/t/:shareToken` already covers viewing). Zero new backend work, but loses the "browse" feel
  the wireframe (Screen 10) asked for.

Don't build `/community` against a guessed endpoint — confirm (a) or (b) first.

### Gap 2 — Admin analytics tab has more UI than the backend scopes

`backend-architecture.md` §3.9 defines `GET /api/admin/stats` as: total users, total trips, top 5
cities by stop count, top 5 activities by booking count — **aggregate counts and two top-5 lists,
no time series.** The `ui-design/` AdminScreen's "User trends & analytics" tab, however, mocks a
weekly trips-created line chart and a trips-by-season donut chart — neither has a corresponding
query in `admin.repository.js` as scoped.

**What maps cleanly to `/admin/stats` as-is:**
- "Popular cities" tab → `stats.topCities`
- "Popular activities" tab → `stats.topActivities`
- Two stat tiles (total users, total trips) on whichever page ends up as the admin landing view

**What doesn't, yet:**
- The weekly trend line chart and season donut — these need either a new aggregate query (e.g.
  `GET /api/admin/stats/trends?weeks=8`, grouping `trips.created_at` by week) or get cut from
  scope for the hackathon and replaced with the two stat tiles above.

Recommendation: **cut the trend/season charts for v1**, ship `AdminStatsPage` as totals + the two
top-5 lists (which is all `/admin/stats` already returns), and only add the trends endpoint if
there's time left after the core 12-screen flow works end to end — this is optional scope per
`backend-architecture.md` §3.9's own "PS Screen 13 — optional but part of the original spec" note.

### Gap 3 — Landing page's "Top regional selections" has no dedicated endpoint either

`cities` is a seeded catalog table with an `image_url` and a `popularity` column
(`database-design.md`) but `backend-architecture.md` §3.5 only exposes
`GET /api/cities/search?q=` — a search-by-query endpoint, not a "give me N popular cities" one.

**Smallest fix:** `GET /api/cities/search` with no `q` (or a dedicated `?sort=popularity&limit=5`)
already has everything it needs (`popularity` column) — this is a query-shape addition to an
*existing* endpoint, not a new one. Confirm with backend before wiring the Landing page's regional
cards; don't call `/search?q=` with an empty string and hope it returns something reasonable.

---

## 4. Folder Structure (instantiated — see `FRONTEND_GUIDE.md` §2 for the annotated version)

```
src/
├── main.jsx
├── router.jsx
├── index.css
├── app/
│   ├── store.js
│   ├── hooks.js
│   └── api.js
├── components/
│   ├── ui/                         # Button, Input, Field, Textarea, Card, Badge, Avatar,
│   │                                #   SearchToolbar, ScreenRail→(dropped, was prototype-only nav),
│   │                                #   RegionCard, TripCard, PlaceCard, LineChart, BarChart, DonutChart
│   └── layout/
│       ├── AppLayout.jsx           # ports TopBar.jsx + AccountMenu.jsx + ThemeToggle.jsx
│       ├── AdminLayout.jsx         # ports AdminTopBar.jsx
│       └── AuthLayout.jsx          # ports AuthPanel.jsx (AuthShell)
├── features/
│   ├── auth/       { authApi.js, schemas.js }
│   ├── users/       { usersApi.js, schemas.js }
│   ├── trips/       { tripsApi.js, schemas.js }
│   ├── itinerary/   { itineraryApi.js, schemas.js }
│   ├── cities/      { citiesApi.js }
│   ├── activities/  { activitiesApi.js }
│   ├── budget/       { budgetApi.js }
│   ├── publicShare/ { publicShareApi.js }
│   ├── admin/        { adminApi.js, schemas.js }
│   └── ui/           { uiSlice.js }             # the one plain Redux slice, per FRONTEND_GUIDE.md §4
├── pages/
│   ├── LoginPage.jsx, RegisterPage.jsx, ForgotPasswordPage.jsx, ResetPasswordPage.jsx
│   ├── LandingPage.jsx, CreateTripPage.jsx, BuildItineraryPage.jsx
│   ├── TripListingPage.jsx, TripDetailPage.jsx
│   ├── ProfilePage.jsx, SearchPage.jsx, CommunityPage.jsx, CalendarPage.jsx
│   ├── PublicTripPage.jsx
│   └── admin/  { AdminLoginPage.jsx, AdminUsersPage.jsx, AdminStatsPage.jsx }
├── routing/  { ProtectedRoute.jsx, AdminRoute.jsx }
└── lib/  { utils.js }
```

Root: `.env` (gitignored, `VITE_API_BASE_URL`), `.env.example`, `vite.config.js`
(`@vitejs/plugin-react` + `@tailwindcss/vite`, same as `ui-design/vite.config.js`).

---

## 5. Build Order

1. **Skeleton** — `app/store.js`, `app/api.js`, `router.jsx` with empty page stubs, the three
   layouts (port `TopBar`/`AdminTopBar`/`AuthShell` from `ui-design/` unchanged), `ProtectedRoute`/
   `AdminRoute`.
2. **Auth** — `authApi.js` (signup/login/logout/forgot/reset/getMe), `LoginPage`/`RegisterPage`
   wired with react-hook-form + Zod, confirm the httpOnly cookie round-trip actually works against
   the real backend (`credentials: 'include'` on both client and server CORS config) before
   building anything behind `ProtectedRoute`.
3. **Trips + Itinerary** — `tripsApi.js`, `itineraryApi.js`; `CreateTripPage` → `BuildItineraryPage`
   → `TripDetailPage` flow, since this is the core loop the rest of the app hangs off of.
4. **Trip listing + Profile** — `TripListingPage` (client-side grouping, §2), `ProfilePage`
   (`usersApi.js`, including the real photo upload wired to `POST /api/users/me/photo` — the
   `ui-design/` version only previewed a local file, this one actually persists it).
5. **Cities + Activities + Budget** — `SearchPage`, budget breakdown on `TripDetailPage`.
6. **Public share** — Share panel on `TripDetailPage` (toggle `is_public`, show `share_token` link),
   `PublicTripPage` at `/t/:shareToken`.
7. **Resolve Gap 1 and Gap 3** (Community, Landing regional cards) once the backend decision from
   §3 is made — don't block the rest of the build on this.
8. **Admin** — `AdminUsersPage`, `AdminStatsPage` scoped to what `/api/admin/stats` actually
   returns (Gap 2) — trend charts only if time remains.
9. **Calendar** — last, since it's pure client-side rendering of data every other page already
   fetches (`GET /api/trips`), no new endpoint dependency.
