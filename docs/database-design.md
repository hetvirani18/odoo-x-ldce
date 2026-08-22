# GlobeTrotter — Database Design (MySQL)

ER diagram and relational schema for the GlobeTrotter travel-planning platform.

**v1 — initial schema.** Single-database design (no multi-tenancy — this is a consumer app, not
a B2B SaaS with per-dealer isolation). Core chain: `users` owns many `trips`, a `trip` is made of
ordered `stops` (each a city visit with dates), each `stop` can have many `activities` assigned to
it via the `trip_activities` join table, and a `trip` has one computed `cost_estimates` row. `cities`
and `activities` are shared catalog tables (seeded + optionally enriched from external providers,
see `docs/backend-architecture.md` §6) — not owned by any one user.

**v2 — forgot/reset password + admin role.** New `password_reset_tokens` table backs the
forgot-password flow (`docs/backend-architecture.md` §4a) — a one-time, short-lived, hashed token
per reset request, deliberately kept separate from `users` rather than adding reset columns
directly on it (see Design Decisions below). `users` also gains a `role ENUM('user','admin')`
column (default `'user'`) to back the PS's Screen 13 (Admin / Analytics Dashboard — optional but
part of the original spec). No separate `admins` table: an admin is just a user with a different
role, same as `ref/`'s tenant `users.role` pattern — there's no platform-staff-vs-dealer split
here like `ref/`'s `securepass_employee`, since GlobeTrotter has no multi-tenant organizations to
separate staff from.

---

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ TRIPS : "owns"
    USERS ||--o{ PASSWORD_RESET_TOKENS : "requests"
    TRIPS ||--o{ STOPS : "has"
    CITIES ||--o{ STOPS : "visited in"
    STOPS ||--o{ TRIP_ACTIVITIES : "schedules"
    ACTIVITIES ||--o{ TRIP_ACTIVITIES : "booked via"
    CITIES ||--o{ ACTIVITIES : "offered in"
    TRIPS ||--o| COST_ESTIMATES : "has one"

    USERS {
        bigint id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar photo_url
        varchar language "default 'en'"
        enum role "user / admin — default 'user'"
        datetime created_at
    }

    TRIPS {
        bigint id PK
        bigint user_id FK
        varchar name
        date start_date
        date end_date
        text description
        text cover_photo_url
        boolean is_public "default false"
        varchar share_token UK "nullable — set when is_public flips true"
        datetime created_at
    }

    STOPS {
        bigint id PK
        bigint trip_id FK
        bigint city_id FK
        date start_date
        date end_date
        int order_index "position within the trip"
    }

    CITIES {
        bigint id PK
        varchar name
        varchar country
        decimal lat
        decimal lng
        enum cost_index "low / medium / high"
        int popularity
    }

    ACTIVITIES {
        bigint id PK
        bigint city_id FK
        varchar name
        varchar category "sightseeing / food / adventure / culture ..."
        decimal cost
        decimal duration_hours
        text description
        text image_url
    }

    TRIP_ACTIVITIES {
        bigint id PK
        bigint stop_id FK
        bigint activity_id FK
        date scheduled_date
        time scheduled_time "nullable"
    }

    COST_ESTIMATES {
        bigint id PK
        bigint trip_id FK UK "one row per trip"
        decimal transport_cost
        decimal accommodation_cost
        decimal activity_cost
        decimal meal_cost
        decimal total_cost "generated: sum of the four above"
        datetime updated_at
    }

    PASSWORD_RESET_TOKENS {
        bigint id PK
        bigint user_id FK
        varchar token_hash UK "sha256 of the emailed token — never store plaintext"
        datetime expires_at "short-lived, e.g. 30 minutes"
        boolean used "default false — single-use"
        datetime created_at
    }
```

---

## 2. Table Summary & Relationships

| # | Table | Purpose | Key Relationships |
|---|-------|---------|-------------------|
| 1 | `users` | App account — travelers who create trips | Root of the ownership chain |
| 2 | `trips` | A user's planned multi-city journey | users 1→N; owns stops + one cost_estimates row |
| 3 | `stops` | One city leg of a trip, with its own date range and position | trips 1→N, cities 1→N |
| 4 | `cities` | Shared destination catalog (seeded + provider-enriched) | referenced by stops, owns activities |
| 5 | `activities` | Shared things-to-do catalog, scoped to one city | cities 1→N; referenced by trip_activities |
| 6 | `trip_activities` | Join row: an activity scheduled within a specific stop | stops 1→N, activities 1→N |
| 7 | `cost_estimates` | Computed budget breakdown for a trip | trips 1→1 |
| 8 | `password_reset_tokens` | One-time, hashed, short-lived tokens backing the forgot-password flow | users 1→N (a user may request several resets over time) |
| — | `cost_rates` | Lookup table: per_night_rate / per_day_meal_rate by cost_index | referenced by budget calc, not a business entity |

No row-level tenancy needed — every table is naturally scoped by its foreign-key chain back to
`user_id` on `trips`, checked in the controller layer (`docs/BACKEND_GUIDE.md` §8), not the DB.

---

## 3. Design Decisions

- **Table names are plural** (`users`, `trips`, `stops`, ...) — matches the convention used in
  `ref/database-design.md`'s tenant schema, and sidesteps `user` being a reserved word in MySQL
  (which would otherwise require backtick-quoting every reference).
- **`cities` and `activities` are shared catalogs, not per-user data.** Multiple users' trips can
  reference the same city/activity row — this avoids duplicating "Paris, France" a thousand times
  and lets the budget engine's `cost_index` live in exactly one place per city. Seeded at setup
  time (`database/seed.sql`) and optionally enriched live from external providers
  (`docs/backend-architecture.md` §6) — the DB doesn't care which source populated a row.
- **`stops` carries its own `start_date`/`end_date`, not just a city reference.** A trip's itinerary
  is inherently day-ranged per city — Paris days 1–3, Rome days 4–6 — so the date range belongs on
  the stop, not derived from activity dates. `order_index` lets the UI reorder stops (per the
  Itinerary Builder screen's "reorder cities" requirement) without relying on date order alone
  (a user may want to plan stops before finalizing dates).
- **`trip_activities` is a join table, not a column on `activities`.** The same activity (e.g. "Eiffel
  Tower tour") can be scheduled into different stops across different trips without duplicating the
  activity's own cost/description/category — only the scheduling info (`scheduled_date`,
  `scheduled_time`) is per-assignment.
- **`cost_estimates` is one row per trip (`UNIQUE trip_id`), recomputed on read.** Rather than a
  running-total column on `trips` itself, the breakdown lives in its own table so the four cost
  components (transport/accommodation/activity/meal) are individually inspectable — matches the
  Budget & Cost Breakdown screen's requirement to show a per-category split, not just one number.
  `total_cost` is a MySQL `GENERATED ALWAYS AS (...) STORED` column so it's never allowed to
  drift out of sync with its four inputs.
- **`cost_rates` is a tiny lookup table, not hardcoded constants in application code.** Keeping the
  low/medium/high → dollar-amount mapping in the DB means adjusting the budget formula's baseline
  rates is a data change, not a code change or redeploy — useful if the seeded rates need tuning
  after seeing real demo numbers.
- **`share_token` is nullable, set only when `is_public` flips true.** No token is generated for
  private trips — avoids leaking a guessable-but-unused identifier for data nobody can access
  anyway, and matches the Shared/Public Itinerary screen's requirement of a public URL only for
  trips the user explicitly chose to share.
- **`ON DELETE CASCADE` down the ownership chain (`trips` → `stops` → `trip_activities` /
  `cost_estimates`), plain FK (`RESTRICT` by default in InnoDB) on catalog references (`cities`,
  `activities`).** Deleting a trip should delete everything that only exists because of that trip —
  but deleting a `city` or `activity` that's still referenced by an existing stop/trip_activity
  should be blocked, since those are shared catalog rows other trips may depend on.
- **`cost_index` is a MySQL `ENUM`**, not a `VARCHAR` + `CHECK` constraint — idiomatic MySQL for a
  small fixed set of values (matches the `status`/`role`-style enums throughout `ref/database-design.md`),
  and self-documents the valid values directly in the column definition.
- **`role` is a column on `users`, not a separate `admins` table.** An admin is a regular user
  account with `role = 'admin'` — same pattern as `ref/`'s tenant `users.role`
  (`admin`/`operator`/`delivery_staff`). This is different from `ref/`'s `securepass_employee`
  (a wholly separate platform-staff table with its own auth stack), because that split exists
  specifically to separate *platform* staff from *dealer* staff in a multi-tenant SaaS —
  GlobeTrotter has no tenants to separate staff from, so one `users` table with a role column is
  the right level of complexity here.
- **`password_reset_tokens` is its own table, not `reset_token`/`reset_token_expires` columns
  bolted onto `users`.** A separate table lets a user request multiple resets over time without
  overwriting history, keeps `users` free of nullable auth-flow columns that are almost always
  empty, and makes "single-use" a natural row property (`used`) rather than something inferred
  from column state. Only the **hash** of the token is stored (`token_hash`, `sha256`) — same
  reasoning as `password_hash` itself: a DB leak should never hand out usable reset links.
  `expires_at` is a short window (30 minutes) enforced in the controller
  (`docs/backend-architecture.md` §4a), not the DB.
- **No multi-tenancy / database-per-user.** GlobeTrotter is a single consumer-facing app, not a
  B2B platform serving isolated organizations — row-level ownership via `trips.user_id`, checked in
  the controller, is the right level of isolation here (contrast with the database-per-tenant SaaS
  design in `ref/database-design.md`, which would be overkill for this shape of data).

---

## 4. MySQL DDL (Full Schema)

Also maintained standalone at `docs/schema.sql` (identical — that file is the one actually run
against the database; this section mirrors it for reference alongside the design rationale above).

```sql
CREATE TABLE users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    photo_url       TEXT,
    language        VARCHAR(20) DEFAULT 'en',
    role            ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE cities (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    country         VARCHAR(120) NOT NULL,
    lat             DECIMAL(9,6),
    lng             DECIMAL(9,6),
    cost_index      ENUM('low', 'medium', 'high') NOT NULL,
    popularity      INT DEFAULT 0,
    UNIQUE KEY uq_city_name_country (name, country)
) ENGINE=InnoDB;

CREATE TABLE activities (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    city_id         BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(60) NOT NULL,       -- sightseeing, food, adventure, culture, etc.
    cost            DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_hours  DECIMAL(4,1),
    description     TEXT,
    image_url       TEXT,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_activity_city_id (city_id)
) ENGINE=InnoDB;

CREATE TABLE trips (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(200) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    description     TEXT,
    cover_photo_url TEXT,
    is_public       BOOLEAN NOT NULL DEFAULT false,
    share_token     VARCHAR(64) UNIQUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_trip_user_id (user_id),
    CHECK (end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE stops (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id         BIGINT UNSIGNED NOT NULL,
    city_id         BIGINT UNSIGNED NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    order_index     INT NOT NULL DEFAULT 0,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    INDEX idx_stop_trip_id (trip_id),
    INDEX idx_stop_city_id (city_id),
    CHECK (end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE trip_activities (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    stop_id         BIGINT UNSIGNED NOT NULL,
    activity_id     BIGINT UNSIGNED NOT NULL,
    scheduled_date  DATE NOT NULL,
    scheduled_time  TIME,
    FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    UNIQUE KEY uq_trip_activity (stop_id, activity_id, scheduled_date),
    INDEX idx_trip_activity_stop_id (stop_id)
) ENGINE=InnoDB;

CREATE TABLE cost_estimates (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id             BIGINT UNSIGNED NOT NULL UNIQUE,
    transport_cost      DECIMAL(12,2) NOT NULL DEFAULT 0,
    accommodation_cost  DECIMAL(12,2) NOT NULL DEFAULT 0,
    activity_cost       DECIMAL(12,2) NOT NULL DEFAULT 0,
    meal_cost           DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_cost          DECIMAL(12,2) GENERATED ALWAYS AS
                            (transport_cost + accommodation_cost + activity_cost + meal_cost) STORED,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Lookup table for budget formula: per_night_rate / per_day_meal_rate by cost_index
CREATE TABLE cost_rates (
    cost_index          ENUM('low', 'medium', 'high') PRIMARY KEY,
    per_night_rate      DECIMAL(10,2) NOT NULL,
    per_day_meal_rate   DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB;

INSERT INTO cost_rates (cost_index, per_night_rate, per_day_meal_rate) VALUES
    ('low',    35.00, 15.00),
    ('medium', 80.00, 30.00),
    ('high',  180.00, 60.00);

-- Forgot/reset password (v2) — one-time, hashed, short-lived tokens.
-- Never store the plaintext token, only its sha256 hash.
CREATE TABLE password_reset_tokens (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    token_hash      CHAR(64) NOT NULL UNIQUE,
    expires_at      DATETIME NOT NULL,
    used            BOOLEAN NOT NULL DEFAULT false,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reset_token_user_id (user_id)
) ENGINE=InnoDB;
```
