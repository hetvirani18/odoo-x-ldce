# GlobeTrotter Backend — Architecture

> Companion to **`BACKEND_GUIDE.md`** (the style bible — no-TypeScript/no-Result-pattern rules,
> models/repositories/controllers/routes/services conventions, error system, response helpers).
> That guide defines **how** code is written; this document defines **what** we build:
> the full folder tree, every module and endpoint, error-code domains, external services, and
> the itinerary/budget data flow.
> Schema source of truth: `docs/schema.sql`.

---

## 1. Stack (as mandated by BACKEND_GUIDE.md)

Express + **plain JavaScript** (no TypeScript) · `mysql2` (MySQL) · no Result/`neverthrow` wrapper —
`throw AppError` + `asyncHandler` + centralized error middleware · Zod validation · JWT (`jsonwebtoken`) ·
`bcryptjs` (12 rounds) · `axios` for external API calls · `dotenv`.

---

## 2. Folder Structure

```
src/
├── app.js                                  # Bootstrap: json → cors → routers → notFoundHandler → errorHandler
├── config/
│   └── env.js                              # ALL process.env reads (PORT, DB_*, JWT_*, FRONTEND_URL, GEODB_API_KEY, OPENTRIPMAP_API_KEY, AMADEUS_*, SMTP_*)
├── database/
│   ├── db.js                               # mysql2 Pool
│   ├── schema.sql                          # DDL — single source of truth for table shape
│   └── seed.sql                            # Seeded cities, activities, cost_rate rows
├── models/
│   ├── user.model.js                       # User, UserView, CreateUserInput
│   ├── passwordResetToken.model.js         # PasswordResetToken — token hash, user_id, expires_at, used
│   ├── trip.model.js                       # Trip, TripView, CreateTripInput, UpdateTripInput
│   ├── stop.model.js                       # Stop, StopView, CreateStopInput
│   ├── city.model.js                       # City, CityView
│   ├── activity.model.js                   # Activity, ActivityView
│   ├── tripActivity.model.js                # TripActivity — join row (stop + activity + scheduled date/time)
│   └── costEstimate.model.js               # CostEstimate, CostEstimateView
├── repositories/
│   ├── user.repository.js
│   ├── passwordResetToken.repository.js
│   ├── trip.repository.js
│   ├── stop.repository.js
│   ├── city.repository.js                  # includes searchByName() used by seedCityProvider
│   ├── activity.repository.js               # includes searchByCity() used by seedActivityProvider
│   ├── tripActivity.repository.js
│   └── costEstimate.repository.js
├── controllers/
│   ├── auth.controller.js                  # signup, login
│   ├── trip.controller.js                  # CRUD + ownership checks
│   ├── itinerary.controller.js              # add/reorder stops, assign activities to a stop
│   ├── city.controller.js                  # thin wrapper over city.service.js
│   ├── activity.controller.js               # thin wrapper over activity.service.js
│   ├── budget.controller.js                 # triggers budget.service.js, persists cost_estimate
│   ├── publicShare.controller.js            # read-only public itinerary by share_token
│   └── admin.controller.js                  # stats aggregate, user list, role management (PS Screen 13)
├── routes/
│   ├── auth.route.js                        # /api/auth
│   ├── trip.route.js                        # /api/trips
│   ├── stop.route.js                        # /api/trips/:tripId/stops, /api/stops/:id
│   ├── city.route.js                        # /api/cities
│   ├── activity.route.js                    # /api/cities/:cityId/activities
│   ├── budget.route.js                      # /api/trips/:id/budget
│   ├── public.route.js                      # /api/public/trips/:shareToken
│   └── admin.route.js                       # /api/admin — all routes authenticate + requireAdmin
├── middleware/
│   ├── auth.middleware.js                   # authenticate, requireAdmin
│   ├── ratelimit.middleware.js               # global request-rate limiter
│   ├── error.middleware.js                  # errorHandler, notFoundHandler
│   ├── validateRequest.middleware.js        # Zod body/query/params
│   └── asyncHandler.js                      # wraps handlers, forwards throws to next()
├── services/
│   ├── cityProvider/
│   │   ├── cityProvider.interface.js
│   │   ├── geoDbCityProvider.js             # real: GeoDB/GeoNames live search
│   │   └── seedCityProvider.js              # fallback: our own seeded `city` table
│   ├── activityProvider/
│   │   ├── activityProvider.interface.js
│   │   ├── openTripMapProvider.js           # real: OpenTripMap POIs
│   │   └── seedActivityProvider.js          # fallback: our own seeded `activity` table
│   ├── pricingProvider/
│   │   ├── pricingProvider.interface.js
│   │   ├── amadeusPricingProvider.js        # real: flight/hotel price estimates
│   │   └── costIndexPricingProvider.js      # formula-based: cost_rate table × nights/days
│   ├── city.service.js                      # picks geoDb → falls back to seed
│   ├── activity.service.js                  # picks openTripMap → falls back to seed
│   ├── budget.service.js                    # combines all pricing sources into one CostEstimate
│   └── email.service.js                     # sends the forgot-password reset email (nodemailer, single provider — see BACKEND_GUIDE.md §9.5)
└── utils/
    ├── AppError.js                          # AppError class + ERRORS catalog
    ├── response.js                          # successResponse / errorResponse
    └── logger.js                            # simple console-based structured logger
```

Root: `.env` (gitignored), `.env.example`, `package.json` (`"type": "commonjs"` or `"module"` — pick one, stay consistent).

---

## 3. Module Inventory & API Endpoints

All routers mount under `/api/...`. Middleware chain order (guide §12):
`authenticate → validateRequest → handler`, all handlers wrapped in `asyncHandler`.

### 3.1 Auth — `/api/auth`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/signup` | public | Create user (name, email, password) → bcrypt hash → sets `access_token` cookie |
| POST | `/login` | public | Verify credentials → sets `access_token` cookie |
| POST | `/logout` | authed | Clears the `access_token` cookie |
| POST | `/forgot-password` | public | Body: `email`. Generates a reset token, emails a reset link. Always responds with a generic success message, regardless of whether the email exists (§4a). |
| POST | `/reset-password` | public | Body: `token`, `new_password`. Validates the token, updates `password_hash`, marks the token used. |

### 3.2 Trips — `/api/trips`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/` | authed | Create trip (name, start_date, end_date, description) |
| GET | `/` | authed | List own trips |
| GET | `/:id` | authed, owner | Trip detail incl. stops |
| PUT | `/:id` | authed, owner | Update name/dates/description/is_public |
| DELETE | `/:id` | authed, owner | Delete trip (cascades stops, trip_activities, cost_estimates) |

### 3.3 Stops / Itinerary — nested under trips
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/trips/:tripId/stops` | authed, owner | Add a stop: city_id, start_date, end_date |
| PUT | `/api/stops/:id` | authed, owner | Update dates or reorder (`order_index`) |
| DELETE | `/api/stops/:id` | authed, owner | Remove a stop |
| POST | `/api/stops/:id/activities` | authed, owner | Assign an activity to this stop (activity_id, scheduled_date, scheduled_time) |
| DELETE | `/api/stops/:id/activities/:activityId` | authed, owner | Remove an activity from this stop |

### 3.4 Cities — `/api/cities`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/search?q=` | authed | Live search via `city.service.js` (GeoDB → seed fallback), merged with our own `cost_index` |

### 3.5 Activities — nested under cities
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/cities/:cityId/activities` | authed | Live search via `activity.service.js` (OpenTripMap → seed fallback); supports `?category=&maxCost=` filters |

### 3.6 Budget — `/api/trips/:id/budget`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | authed, owner | Compute (or recompute) and return the trip's `CostEstimate` — transport + accommodation + activity + meal breakdown |

### 3.7 Public Share — `/api/public/trips/:shareToken`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | public, no auth | Read-only itinerary view — only returned if the trip's `is_public = true` |

### 3.8 Admin — `/api/admin` (PS Screen 13 — optional but part of the original spec)
An admin is a regular user with `role = 'admin'` (§4). Every route here is
`authenticate` → `requireAdmin`. Login itself is **not** duplicated as a separate backend
endpoint — admins authenticate through the same `POST /api/auth/login` as everyone else (§3.1),
the JWT already carries `role`. The split is **frontend-only**: a dedicated `/admin/login` page
posts to that same `/api/auth/login` endpoint, then routes to `/admin/...` on success — better UX
(no role-select dropdown on the traveler-facing form, a clean admin-specific entry point) without
duplicating auth logic on the backend.
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/stats` | admin | Aggregate counts: total users, total trips, top 5 cities by stop count, top 5 activities by booking count — single aggregate queries, no N+1 |
| GET | `/users` | admin | Paginated list of all users (id, name, email, role, created_at — never `password_hash`) |
| PATCH | `/users/:id/role` | admin | Body: `{ role: 'user'\|'admin' }` — promote/demote a user |

---

## 4. Auth

**Access token only — no refresh token.** One JWT, set by the backend as an httpOnly cookie on
signup/login, read by `authenticate` middleware on every subsequent request. The token is never
included in the JSON response body — the frontend never sees or handles it directly, it's just
carried automatically by the browser as a cookie. Logout simply clears the cookie
(`res.clearCookie('access_token')`); there is no token-rotation or refresh endpoint to build.

```javascript
// JWT payload shape
{
  id: number,       // user.id
  email: string,
  role: 'user' | 'admin',
}
```

- `POST /api/auth/signup` — checks `email` uniqueness (`ERRORS.EMAIL_ALREADY_EXISTS`), hashes password (bcrypt, 12 rounds), creates user, sets the `access_token` cookie, returns `{ user }` (no token in the body).
- `POST /api/auth/login` — verifies password with `bcrypt.compare`, throws `ERRORS.INVALID_CREDENTIALS` on mismatch (same error for "no such user" and "wrong password" — don't leak which one), sets the `access_token` cookie, returns `{ user }`.
- `POST /api/auth/logout` — `res.clearCookie('access_token')`, no body needed.
- `authenticate` middleware reads the `access_token` cookie (via `cookie-parser`), verifies the JWT, and sets `req.user = { id, email, role }`. Every non-public route uses it.
- `requireAdmin` middleware (chained after `authenticate`) checks `req.user.role === 'admin'`, throws `ERRORS.ADMIN_ONLY_ROUTE` otherwise. Used only by `/api/admin/*` routes (§3.8).
- Ownership check (does `req.user.id` own this trip) happens in the **controller**, not the middleware — see `BACKEND_GUIDE.md §8`.
- Cookie flags: `httpOnly: true` (JS on the frontend can't read it — mitigates XSS token theft), `sameSite: 'lax'` (works with the frontend calling the API directly; use `'none'` + `secure: true` only if frontend and backend end up on different origins/domains), `secure: true` in production (HTTPS only), `maxAge` matching the JWT's own expiry.

### 4a. Forgot / Reset Password

A separate flow from the access-token cookie above — this doesn't touch JWTs at all, it's a
one-time token stored in its own table (`password_reset_tokens`, see `docs/database-design.md`).

1. `POST /api/auth/forgot-password` — looks up the user by email. If found: generates a random
   token, stores **only its hash** (`sha256`, same reasoning as never storing a plaintext
   password) with a short expiry (30 minutes) in `password_reset_tokens`, and calls
   `email.service.js` to send a reset link containing the **plaintext** token
   (`FRONTEND_URL/reset-password?token=...`). If not found: does nothing. **Either way, the route
   returns the same generic success message** ("If that email exists, a reset link has been
   sent") — this is a deliberate anti-enumeration measure, not an oversight; never let this
   endpoint's response reveal whether an email is registered.
2. `POST /api/auth/reset-password` — hashes the submitted token the same way, looks it up in
   `password_reset_tokens`. Throws `ERRORS.RESET_TOKEN_INVALID` if no match or already used,
   `ERRORS.RESET_TOKEN_EXPIRED` if past `expires_at`. On success: updates the user's
   `password_hash` (bcrypt, 12 rounds, same as signup), marks the token row `used = true` (tokens
   are single-use), and does **not** log the user in automatically — they go to the login screen
   with their new password.
3. Email delivery failure (`ERRORS.EMAIL_SEND_FAILED` from `email.service.js`) is caught and
   logged in the controller, but does not change the generic response from step 1 — same
   anti-enumeration reasoning, and a broken SMTP config shouldn't surface as a confusing error to
   the end user.

---

## 5. Error Catalog — GlobeTrotter domains

`1xxxx` common and `2xxxx` auth come from the guide. Domain-specific:

| Range | Domain | Examples |
|---|---|---|
| 2xxxx | Auth | (from the guide) plus `RESET_TOKEN_INVALID` 20005·400, `RESET_TOKEN_EXPIRED` 20006·400, `ADMIN_ONLY_ROUTE` 20007·403 |
| 3xxxx | Trip / Stop / Itinerary | `TRIP_NOT_FOUND` 30001·404, `STOP_NOT_FOUND` 30002·404, `TRIP_NOT_OWNED` 30003·403, `INVALID_DATE_RANGE` 30004·422 (stop dates outside trip dates) |
| 4xxxx | City / Activity | `CITY_NOT_FOUND` 40001·404, `ACTIVITY_NOT_FOUND` 40002·404, `ACTIVITY_NOT_IN_CITY` 40003·422 |
| 5xxxx | Budget | `BUDGET_CALC_FAILED` 50001·500 |
| 6xxxx | External providers | `CITY_PROVIDER_UNAVAILABLE` 60001·502, `ACTIVITY_PROVIDER_UNAVAILABLE` 60002·502, `PRICING_PROVIDER_UNAVAILABLE` 60003·502, `EMAIL_SEND_FAILED` 60004·502 — all of these should be caught internally by the owning `*.service.js` and rarely actually reach the client |

All added to `ERRORS` in `src/utils/AppError.js` — never inline `new AppError(...)` (guide §4).

---

## 6. External Services

| Service | Interface | Real impl | Fallback | Config keys |
|---|---|---|---|---|
| City search | `search(query) → CityResult[]` | `geoDbCityProvider.js` (GeoDB Cities API) | `seedCityProvider.js` (our `cities` table) | `GEODB_API_KEY` |
| Activity search | `search(cityName) → ActivityResult[]` | `openTripMapProvider.js` (OpenTripMap) | `seedActivityProvider.js` (our `activities` table) | `OPENTRIPMAP_API_KEY` |
| Flight/hotel pricing | `estimate(from, to, dates) → PriceResult` | `amadeusPricingProvider.js` (Amadeus sandbox) | flat per-hop estimate constant | `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET` |
| Meal/accommodation pricing | `rateFor(costIndex) → { perNight, perMeal }` | — (no API covers this) | `costIndexPricingProvider.js` reads `cost_rates` table | — |
| Password reset email | `sendPasswordResetEmail(to, resetLink)` | `email.service.js` (nodemailer/SMTP) | none — single provider, see guide §9.5 | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` |

All providers throw a named `ERRORS.*_PROVIDER_UNAVAILABLE` (or `EMAIL_SEND_FAILED`) on failure; the owning `*.service.js` catches that and falls back — or, for email, just logs and lets the controller respond with its generic success message anyway (guide §9.5, §4a above) — rather than letting it reach the controller as an unhandled error.

---

## 7. Itinerary & Budget Data Flow

```
POST /api/trips                     → creates Trip (name, dates)
        │
POST /api/trips/:id/stops           → adds Stop (city_id, dates) — repeat per city
        │
POST /api/stops/:id/activities      → assigns Activity to a Stop, with scheduled_date/time
        │
GET /api/trips/:id/budget           → budget.service.js walks every Stop:
        │                               - transport_cost   += amadeusPricingProvider estimate for the hop into this city
        │                               - accommodation_cost += nights_at_city × per_night_rate(city.cost_index)
        │                               - activity_cost    += sum of assigned activities' cost
        │                               - meal_cost         += days_at_city × per_day_meal_rate(city.cost_index)
        ▼
                          upserts one `cost_estimates` row per trip (unique on trip_id)
```

- Budget is **recomputed on every `GET /budget` call** (not cached indefinitely) since stops/activities can change between views — cheap enough at hackathon data volumes (a handful of stops/activities per trip).
- `GET /api/trips/:id` (trip detail) does **not** include the budget by default — the frontend calls `/budget` separately so a slow external pricing call never blocks the itinerary view from loading.

---

## 8. Testing Strategy (hackathon-scoped, lightweight)

Given the time budget, skip a full test suite. Prioritize:

| Layer | What to verify manually/quickly |
|---|---|
| Auth | signup → login → authenticated request round-trip works |
| Trip/Stop/Itinerary CRUD | create trip → add 2+ stops → add activities → ownership check rejects another user's trip |
| Budget | matches the formula in §10 of `BACKEND_GUIDE.md` for a known set of stops/activities (hand-calculate one example, compare) |
| Service fallback | temporarily break the API key for one provider, confirm the app still returns seeded data instead of erroring |

If time allows, a handful of Jest tests on `budget.service.js`'s pure calculation logic (no DB, no network) give the best return for the least effort.

---

## 9. Build Order

1. **Skeleton** — config/env.js, db.js, utils (AppError/response/logger), middleware (asyncHandler/error/validateRequest), app.js
2. **Schema + seed data** — run `schema.sql` + `seed.sql` (cities, activities, cost_rates)
3. **Auth** — signup/login/logout, JWT set as httpOnly cookie (no refresh token), `authenticate` middleware, forgot/reset password (`password_reset_tokens` + `email.service.js`)
4. **Trips + Stops** — CRUD, ownership checks (unlocks the itinerary builder screen)
5. **City/Activity services** — provider interfaces + real + seed fallback implementations, wired into their routes
6. **Trip Activities** — assign/remove activities on a stop
7. **Budget service** — pricing providers + formula, `GET /trips/:id/budget`
8. **Public share** — `share_token` generation on `is_public = true`, public read-only route
9. **Admin** (optional, PS Screen 13) — `requireAdmin` middleware, `/api/admin/stats`, `/api/admin/users`
10. Wire up frontend against all of the above
