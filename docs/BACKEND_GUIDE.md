# GlobeTrotter Backend — Architecture & Code Style Guide

> Single source of truth for backend code on this project. Plain JavaScript (Node.js + Express), no TypeScript.
> Every model, repository, controller, route, middleware, and service should follow these patterns.

---

## 1. Project Structure

```
src/
├── app.js                          # Express app init, middleware registration, server start
├── config/
│   └── env.js                      # All env var reads — single place, no process.env elsewhere
├── database/
│   ├── db.js                       # mysql2 Pool creation + connectToDatabase()
│   ├── schema.sql                  # DDL (source of truth for the actual table shape)
│   └── seed.sql                    # Seed data — cities, activities, cost_rate
├── models/
│   ├── user.model.js                # TABLE_NAME + typedefs (User, UserView, CreateUserInput, ...)
│   ├── trip.model.js
│   ├── stop.model.js
│   ├── city.model.js
│   ├── activity.model.js
│   └── costEstimate.model.js
├── repositories/
│   ├── user.repository.js           # DB access only, zero business logic
│   ├── trip.repository.js
│   ├── stop.repository.js
│   ├── city.repository.js
│   ├── activity.repository.js
│   └── costEstimate.repository.js
├── controllers/
│   ├── auth.controller.js           # Business logic, calls repositories + services
│   ├── trip.controller.js
│   ├── itinerary.controller.js
│   ├── city.controller.js
│   ├── activity.controller.js
│   └── budget.controller.js
├── routes/
│   ├── auth.route.js
│   ├── trip.route.js
│   ├── city.route.js
│   ├── activity.route.js
│   └── budget.route.js
├── services/
│   ├── cityProvider/
│   │   ├── cityProvider.interface.js   # Documents the required method shape
│   │   ├── geoDbCityProvider.js        # Real implementation (GeoDB/GeoNames)
│   │   └── seedCityProvider.js         # Fallback implementation (reads from DB seed data)
│   ├── activityProvider/
│   │   ├── activityProvider.interface.js
│   │   ├── openTripMapProvider.js
│   │   └── seedActivityProvider.js
│   ├── pricingProvider/
│   │   ├── pricingProvider.interface.js
│   │   ├── amadeusPricingProvider.js   # Real flight/hotel price lookups
│   │   └── costIndexPricingProvider.js # Formula-based fallback (activities/meals)
│   └── budget.service.js            # Combines pricing providers into one trip budget
├── middleware/
│   ├── auth.middleware.js           # authenticate, requireAuth
│   ├── error.middleware.js          # errorHandler, notFoundHandler
│   ├── validateRequest.middleware.js # Zod-based body/query/params validation
│   └── asyncHandler.js              # Wraps async route handlers, forwards throws to next()
└── utils/
    ├── AppError.js                  # Custom error class + ERRORS catalog
    ├── response.js                  # successResponse() + errorResponse()
    └── logger.js                    # Simple structured logger
```

---

## 2. Technology Stack

| Library | Purpose |
|---|---|
| `express` | Web framework |
| `mysql2` | MySQL driver (async pool) |
| `zod` | Request validation schemas |
| `jsonwebtoken` | JWT creation and verification |
| `bcryptjs` | Password hashing (salt rounds: 12) |
| `dotenv` | Env var loading |
| `cookie-parser` | Reads the httpOnly `access_token` cookie into `req.cookies` |
| `axios` | HTTP client for external API calls (city/activity/pricing services) |

**Package type:** plain CommonJS or ESM (`"type": "module"`) — pick one per the team's comfort and stay consistent everywhere. No TypeScript, no build step — Node runs the source directly.

---

## 3. No Result Pattern — Plain try/catch + AppError

This project does **not** use a `Result<T, E>` wrapper type. Instead:

1. **Repositories and services** throw a custom `AppError` (never a raw `Error`, never a raw string) on any failure.
2. **Controllers** call repositories/services directly with plain `await` — no unwrapping needed. If something below throws, it propagates up naturally.
3. **Routes** are wrapped in `asyncHandler()`, which catches anything thrown in the handler and forwards it to `next(error)` — this is what reaches `error.middleware.js`.
4. **Never** manually `try/catch` in a controller just to re-throw — let it propagate. Only catch where you need to translate a low-level error into a specific `AppError` (e.g. a unique-constraint violation → `ERRORS.EMAIL_ALREADY_EXISTS`), or where you're calling an external API and want a graceful fallback (see §9 Services).

```javascript
// repository — throws on failure, returns plain data on success
async function findById(id) {
    const [rows] = await db.query('SELECT * FROM trips WHERE id = ?', [id]);
    if (rows.length === 0) {
        throw ERRORS.TRIP_NOT_FOUND;
    }
    return rows[0];
}

// controller — no unwrapping, just await
async function getTrip(tripId) {
    const trip = await TripRepository.findById(tripId);
    return toTripView(trip);
}

// route — asyncHandler catches whatever getTrip() throws
router.get('/:id', asyncHandler(async (req, res) => {
    const trip = await getTrip(Number(req.params.id));
    res.json(successResponse(trip, 'Trip fetched successfully'));
}));
```

### `asyncHandler.js`

```javascript
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = asyncHandler;
```

---

## 4. Error System

**File:** `src/utils/AppError.js`

```javascript
class AppError extends Error {
    constructor(message, code, statusCode) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

// Error code convention:
// 1xxxx — Common / general errors
// 2xxxx — Auth
// 3xxxx — Trip / Stop / Itinerary
// 4xxxx — City / Activity
// 5xxxx — Budget / Cost estimation
// 6xxxx — External service / provider errors

const ERRORS = {
    // Common (1xxxx)
    DATABASE_ERROR:        new AppError('Database operation failed', 10001, 500),
    VALIDATION_ERROR:      new AppError('Validation failed', 10002, 422),
    RESOURCE_NOT_FOUND:    new AppError('Resource not found', 10003, 404),
    ROUTE_NOT_FOUND:       new AppError('Route not found', 10004, 404),

    // Auth (2xxxx)
    NO_TOKEN_PROVIDED:     new AppError('No authentication token provided', 20001, 401),
    INVALID_AUTH_TOKEN:    new AppError('Invalid authentication token', 20002, 401),
    EMAIL_ALREADY_EXISTS:  new AppError('Email already registered', 20003, 409),
    INVALID_CREDENTIALS:   new AppError('Invalid email or password', 20004, 401),

    // Trip / Stop (3xxxx)
    TRIP_NOT_FOUND:        new AppError('Trip not found', 30001, 404),
    STOP_NOT_FOUND:        new AppError('Stop not found', 30002, 404),
    TRIP_NOT_OWNED:        new AppError('You do not own this trip', 30003, 403),

    // City / Activity (4xxxx)
    CITY_NOT_FOUND:        new AppError('City not found', 40001, 404),
    ACTIVITY_NOT_FOUND:    new AppError('Activity not found', 40002, 404),

    // Budget (5xxxx)
    BUDGET_CALC_FAILED:    new AppError('Failed to calculate trip budget', 50001, 500),

    // External services (6xxxx)
    CITY_PROVIDER_UNAVAILABLE:     new AppError('City search service unavailable', 60001, 502),
    ACTIVITY_PROVIDER_UNAVAILABLE: new AppError('Activity search service unavailable', 60002, 502),
    PRICING_PROVIDER_UNAVAILABLE:  new AppError('Pricing service unavailable', 60003, 502),
};

module.exports = { AppError, ERRORS };
```

**Rules:**
- Every new error type gets added to `ERRORS` first — never `throw new AppError(...)` inline in business logic.
- Never throw a generic `Error` — always an `AppError` from the catalog.

---

## 5. Response Helpers

**File:** `src/utils/response.js`

```javascript
function successResponse(data, message = 'Operation successful') {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
}

function errorResponse(message, code = 10000) {
    return {
        success: false,
        error: { code, message },
        timestamp: new Date().toISOString(),
    };
}

module.exports = { successResponse, errorResponse };
```

---

## 6. Models — where all input/output shapes live

**File:** `src/models/[entity].model.js`

Since this is JavaScript, "interfaces" are documented with **JSDoc typedefs** — no runtime cost, but editors get autocomplete and it's the single place to look up a shape. Every DB row shape, view shape, and input shape for that entity's repository/controller functions belongs here — never inline in a repository or controller file.

```javascript
// src/models/trip.model.js

const TABLE_NAME = 'trips';

/**
 * @typedef {Object} Trip
 * @property {number} id
 * @property {number} user_id
 * @property {string} name
 * @property {string} start_date
 * @property {string} end_date
 * @property {string|null} description
 * @property {string|null} cover_photo_url
 * @property {boolean} is_public
 * @property {string|null} share_token
 * @property {Date} created_at
 */

/**
 * @typedef {Object} TripView
 * @property {number} id
 * @property {string} name
 * @property {string} start_date
 * @property {string} end_date
 * @property {string|null} description
 * @property {boolean} is_public
 */

/**
 * @typedef {Object} CreateTripInput
 * @property {number} userId
 * @property {string} name
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} [description]
 * @property {string} [coverPhotoUrl]
 */

/** @param {Trip} row @returns {TripView} */
function toTripView(row) {
    return {
        id: row.id,
        name: row.name,
        start_date: row.start_date,
        end_date: row.end_date,
        description: row.description,
        is_public: row.is_public,
    };
}

module.exports = { TABLE_NAME, toTripView };
```

**Rules:**
- Always export a `toXxxView(row)` mapper from the model — repositories/controllers import it instead of re-writing the same field mapping everywhere.
- Input typedefs (`CreateTripInput`, `UpdateTripInput`, etc.) are documented here, not invented inline in a repository function signature.
- `TABLE_NAME` constant always exported — used by the repository, never hardcoded as a string there.

---

## 7. Repositories

**File:** `src/repositories/[entity].repository.js`

Repositories are the **only place** that run SQL. Zero business logic — no password hashing, no JWT, no budget math.

```javascript
const db = require('../database/db');
const { ERRORS } = require('../utils/AppError');
const { TABLE_NAME } = require('../models/trip.model');

async function findById(id) {
    const [rows] = await db.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
    if (rows.length === 0) {
        throw ERRORS.TRIP_NOT_FOUND;
    }
    return rows[0];
}

async function findByUserId(userId) {
    const [rows] = await db.query(
        `SELECT * FROM ${TABLE_NAME} WHERE user_id = ? ORDER BY start_date DESC`,
        [userId]
    );
    return rows; // empty array is a valid result — never throw for "no rows" on a list query
}

/** @param {import('../models/trip.model').CreateTripInput} input */
async function create(input) {
    const [result] = await db.query(
        `INSERT INTO ${TABLE_NAME} (user_id, name, start_date, end_date, description, cover_photo_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [input.userId, input.name, input.startDate, input.endDate, input.description ?? null, input.coverPhotoUrl ?? null]
    );
    return findById(result.insertId); // MySQL has no RETURNING — re-query by insertId
}

async function deleteById(id) {
    await db.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
}

module.exports = { findById, findByUserId, create, deleteById };
```

**Repository Rules:**
- Every DB call wrapped implicitly by letting MySQL errors bubble — only catch where translating a specific error (e.g. duplicate-key error `ER_DUP_ENTRY` / errno `1062`) into a named `AppError`.
- `findById`-style single-row lookups throw `ERRORS.X_NOT_FOUND` when nothing is found — **never return `null` or `undefined`**.
- `findByX`-style list lookups return `[]` on no results — an empty array is a valid success, not an error.
- Always use parameterized queries (`?` placeholders) — never string-concatenate user input into SQL.
- When an `INSERT` needs to return the created row, re-query with `findById(result.insertId)` — `mysql2` has no `RETURNING` clause, so never try `SELECT LAST_INSERT_ID()` manually either.
- Export plain named functions, not a class — keep repository modules as flat function collections.

---

## 8. Controllers

**File:** `src/controllers/[entity].controller.js`

Controllers hold **business logic only**: calling repositories, calling services, enforcing ownership rules, composing the final response shape.

```javascript
const TripRepository = require('../repositories/trip.repository');
const { toTripView } = require('../models/trip.model');
const { ERRORS } = require('../utils/AppError');

async function getTrip(tripId, requestingUserId) {
    const trip = await TripRepository.findById(tripId);
    if (trip.user_id !== requestingUserId) {
        throw ERRORS.TRIP_NOT_OWNED;
    }
    return toTripView(trip);
}

async function createTrip(userId, body) {
    const trip = await TripRepository.create({
        userId,
        name: body.name,
        startDate: body.start_date,
        endDate: body.end_date,
        description: body.description,
    });
    return toTripView(trip);
}

module.exports = { getTrip, createTrip };
```

**Controller Rules:**
- Named exported `async` functions — no classes, no default exports.
- Never import `express` in a controller — controllers take plain arguments and return plain data, they never touch `req`/`res`.
- Always map DB rows to `View` types via the model's `toXxxView()` before returning.
- This is where ownership/authorization business rules live (e.g. "does this trip belong to this user") — not in the repository, not in the route.

---

## 9. Services — external API integrations (the important part for this project)

**File:** `src/services/[domain]/`

GlobeTrotter needs three kinds of external data: **cities**, **activities**, and **pricing**. None of them come from a single reliable free API, so every one of these is built as an **interface + swappable implementation**, exactly like the repository pattern — the controller never talks to `axios` or a specific API directly, only to the service abstraction.

### 9.1 Interface convention

Each provider folder documents the required shape with a JSDoc `@typedef` in an `*.interface.js` file — this is not enforced at runtime (plain JS), it's a contract other implementations must follow.

```javascript
// src/services/cityProvider/cityProvider.interface.js

/**
 * @typedef {Object} CityResult
 * @property {string} name
 * @property {string} country
 * @property {number} lat
 * @property {number} lng
 * @property {'low'|'medium'|'high'} cost_index
 */

/**
 * A city provider must implement:
 *   search(query: string): Promise<CityResult[]>
 */
module.exports = {};
```

### 9.2 Real + fallback implementations

```javascript
// src/services/cityProvider/geoDbCityProvider.js
const axios = require('axios');
const { ERRORS } = require('../../utils/AppError');

async function search(query) {
    try {
        const { data } = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
            params: { namePrefix: query, limit: 10 },
            headers: { 'X-RapidAPI-Key': process.env.GEODB_API_KEY },
        });
        return data.data.map((c) => ({
            name: c.city,
            country: c.country,
            lat: c.latitude,
            lng: c.longitude,
            cost_index: null, // GeoDB has no cost data — merged with seed data by the service layer
        }));
    } catch (error) {
        throw ERRORS.CITY_PROVIDER_UNAVAILABLE;
    }
}

module.exports = { search };
```

```javascript
// src/services/cityProvider/seedCityProvider.js
const CityRepository = require('../../repositories/city.repository');

async function search(query) {
    return CityRepository.searchByName(query); // reads from our own seeded `cities` table
}

module.exports = { search };
```

### 9.3 The service layer picks and combines providers — controllers only call the service

```javascript
// src/services/city.service.js
const geoDbProvider = require('./cityProvider/geoDbCityProvider');
const seedProvider = require('./cityProvider/seedCityProvider');

async function searchCities(query) {
    try {
        const liveResults = await geoDbProvider.search(query);
        // enrich live results with our own cost_index from seed data where the city matches
        return liveResults;
    } catch (error) {
        // live provider failed or key not configured — fall back to seeded data, never surface a 502 to the user
        return seedProvider.search(query);
    }
}

module.exports = { searchCities };
```

Controllers only ever call `cityService.searchCities(query)` — they never know or care whether the result came from GeoDB or the seed table. Swapping GeoDB for GeoNames later means writing one new file in `cityProvider/` and changing one line in `city.service.js`.

### 9.4 Apply the same pattern to activities and pricing

- `services/activityProvider/` — `openTripMapProvider.js` (real) + `seedActivityProvider.js` (fallback, reads the `activities` table)
- `services/pricingProvider/` — `amadeusPricingProvider.js` (real flight/hotel prices) + `costIndexPricingProvider.js` (formula-based: `cost_rates` lookup × nights/days, used for activities/meals where no API exists — see §10)
- `services/budget.service.js` combines all pricing sources into the final `cost_estimate` — this is the one place the full budget formula lives, calling into `pricingProvider` implementations rather than hardcoding HTTP calls itself

**Service Rules:**
- A provider file's only job is: call the external API, map the response into our own shape, throw a named `AppError` on failure. No business logic beyond that mapping.
- The `*.service.js` file (not the controller) decides which provider to try first and what to fall back to — controllers never branch on "which API to use."
- Every provider is swappable independently — adding a new city data source never touches `activityProvider/` or `pricingProvider/`.
- API keys are read once in `config/env.js` and passed down — never read `process.env` inside a provider file.

---

## 10. Budget Formula (implemented in `budget.service.js`)

```
total_cost = transport_cost + accommodation_cost + activity_cost + meal_cost

transport_cost      = amadeusPricingProvider (real flight estimate) — falls back to a flat per-hop estimate if unavailable
accommodation_cost  = nights_at_city × per_night_rate(cost_index)   — costIndexPricingProvider, from cost_rate table
activity_cost       = sum of selected activity costs                — straight sum, no external API needed
meal_cost           = days_at_city × per_day_meal_rate(cost_index) — costIndexPricingProvider, from cost_rate table
```

`cost_rates` (seeded lookup table, see `schema.sql`) is what makes `accommodation_cost`/`meal_cost` dynamic without a paid full-cost API — every city carries a `cost_index` of `low`/`medium`/`high`, and `costIndexPricingProvider.js` reads the matching rate row.

---

## 11. Middleware

### `error.middleware.js`

```javascript
const { AppError } = require('../utils/AppError');
const { errorResponse } = require('../utils/response');

function errorHandler(error, req, res, next) {
    console.error(error);
    if (error instanceof AppError) {
        return res.status(error.statusCode).json(errorResponse(error.message, error.code));
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json(errorResponse('Invalid authentication token', 20002));
    }
    return res.status(500).json(errorResponse('Internal server error', 10000));
}

function notFoundHandler(req, res) {
    res.status(404).json(errorResponse(`Route ${req.method} ${req.path} not found`, 10004));
}

module.exports = { errorHandler, notFoundHandler };
```

`errorHandler` is registered once at the bottom of `app.js`, after all routers. `notFoundHandler` is registered after `errorHandler`'s router mounts, as the final catch-all.

### `auth.middleware.js`

**Auth strategy: access token only, no refresh token.** The token is a plain JWT with a
reasonably long expiry (see `docs/backend-architecture.md` §4), set by the backend as an
**httpOnly cookie** on login/signup — never returned in the JSON response body, never stored or
attached manually by the frontend. This keeps the client simple (no token refresh flow, no
storing anything in `localStorage`) at the cost of the token being valid until it expires or the
cookie is cleared on logout — an acceptable tradeoff for a hackathon-scoped app.

```javascript
const jwt = require('jsonwebtoken');
const { ERRORS } = require('../utils/AppError');
const { JWT_SECRET } = require('../config/env');

function authenticate(req, res, next) {
    const token = req.cookies.access_token;
    if (!token) {
        return next(ERRORS.NO_TOKEN_PROVIDED);
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        next(ERRORS.INVALID_AUTH_TOKEN);
    }
}

module.exports = { authenticate };
```

`app.js` must register `app.use(cookieParser())` before any router that uses `authenticate`.

### `validateRequest.middleware.js`

```javascript
const { ERRORS } = require('../utils/AppError');

function validateRequest({ body, query, params }) {
    return (req, res, next) => {
        if (body) {
            const parsed = body.safeParse(req.body);
            if (!parsed.success) return next(ERRORS.VALIDATION_ERROR);
            req.body = parsed.data;
        }
        if (query) {
            const parsed = query.safeParse(req.query);
            if (!parsed.success) return next(ERRORS.VALIDATION_ERROR);
            req.query = parsed.data;
        }
        next();
    };
}

module.exports = validateRequest;
```

---

## 12. Routes

**File:** `src/routes/[entity].route.js`

Routes are thin: define Zod schemas, chain middleware, call the controller, send the response. Every handler is wrapped in `asyncHandler`.

```javascript
const { Router } = require('express');
const { z } = require('zod');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest.middleware');
const { successResponse } = require('../utils/response');
const { getTrip, createTrip } = require('../controllers/trip.controller');

const SCHEMA = {
    CREATE_TRIP: z.object({
        name: z.string().min(1),
        start_date: z.string(),
        end_date: z.string(),
        description: z.string().optional(),
    }),
};

const tripRouter = Router();

tripRouter.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const trip = await getTrip(Number(req.params.id), req.user.id);
    res.json(successResponse(trip, 'Trip fetched successfully'));
}));

tripRouter.post(
    '/',
    authenticate,
    validateRequest({ body: SCHEMA.CREATE_TRIP }),
    asyncHandler(async (req, res) => {
        const trip = await createTrip(req.user.id, req.body);
        res.status(201).json(successResponse(trip, 'Trip created successfully'));
    })
);

module.exports = tripRouter;
```

**Route Rules:**
- All Zod schemas live in a `SCHEMA` object at the top of the file.
- Every handler wrapped in `asyncHandler(...)` — this is what replaces manual try/catch or a Result-unwrap in every route.
- Middleware order: `authenticate` → `validateRequest(...)` → handler.
- `res.status(201)` for creates, default `200` otherwise.
- Routes are exported as the module's default export, named `[entity]Router`.

---

## 13. Module Inventory (GlobeTrotter-specific)

| Module | Routes | Notes |
|---|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout` | bcrypt (12 rounds) + JWT as httpOnly cookie, no refresh token |
| Trip | `POST /api/trips`, `GET /api/trips`, `GET /api/trips/:id`, `PUT /api/trips/:id`, `DELETE /api/trips/:id` | ownership check in controller |
| Stop / Itinerary | `POST /api/trips/:tripId/stops`, `PUT /api/stops/:id`, `DELETE /api/stops/:id`, `POST /api/stops/:id/activities` | nested under trip |
| City | `GET /api/cities/search?q=` | uses `city.service.js` (GeoDB + seed fallback) |
| Activity | `GET /api/cities/:cityId/activities` | uses `activity.service.js` (OpenTripMap + seed fallback) |
| Budget | `GET /api/trips/:id/budget` | uses `budget.service.js` — computes and persists into `cost_estimates` |
| Public share | `GET /api/public/trips/:shareToken` | no auth, read-only |

---

## 14. Quick Reference Checklist

- [ ] No TypeScript, no `neverthrow`/Result wrapper — plain `async/await` + `throw AppError`
- [ ] Every route handler wrapped in `asyncHandler`
- [ ] Every input/output shape documented via JSDoc typedef in the entity's `model.js`
- [ ] Repositories: DB only, throw `ERRORS.X_NOT_FOUND` on missing single row, return `[]` on empty list
- [ ] Controllers: business logic only, map to `View` via `toXxxView()`, never touch `req`/`res`
- [ ] External APIs (city/activity/pricing) always go through a `services/*Provider/` interface + implementation, never called directly from a controller
- [ ] Every service has a fallback (seeded data) so a flaky third-party API never breaks the app
- [ ] All errors pre-defined in `ERRORS` catalog — never an inline `new AppError(...)` in business logic
