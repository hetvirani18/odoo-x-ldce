-- GlobeTrotter database schema (MySQL)
-- Mirrors docs/database-design.md — that file has the full rationale for these choices.
CREATE DATABASE IF NOT EXISTS globetrotter;
USE globetrotter;

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
    image_url       TEXT,
    UNIQUE KEY uq_city_name_country (name, country)
) ENGINE=InnoDB;

CREATE TABLE activities (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    city_id         BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(60) NOT NULL,
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

-- Forgot/reset password — one-time, hashed, short-lived tokens.
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
