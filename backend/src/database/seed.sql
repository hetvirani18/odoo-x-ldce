-- Seed data — cost_rates is required for the budget formula to work at all.
-- Cities/activities below are a small starter set for local dev/demo; expand as needed.
CREATE DATABASE IF NOT EXISTS globetrotter;
USE globetrotter;

INSERT INTO cost_rates (cost_index, per_night_rate, per_day_meal_rate) VALUES
    ('low',    35.00, 15.00),
    ('medium', 80.00, 30.00),
    ('high',  180.00, 60.00);

INSERT INTO cities (name, country, lat, lng, cost_index, popularity) VALUES
    ('Paris', 'France', 48.856613, 2.352222, 'high', 95),
    ('Rome', 'Italy', 41.902782, 12.496366, 'medium', 90),
    ('Bangkok', 'Thailand', 13.756331, 100.501762, 'low', 85),
    ('Barcelona', 'Spain', 41.385063, 2.173404, 'medium', 88),
    ('Tokyo', 'Japan', 35.689487, 139.691711, 'high', 92),
    ('Goa', 'India', 15.2993, 74.1240, 'low', 80);

INSERT INTO activities (city_id, name, category, cost, duration_hours, description) VALUES
    (1, 'Eiffel Tower Visit', 'sightseeing', 30.00, 2.5, 'Iconic tower with panoramic city views'),
    (1, 'Louvre Museum Tour', 'culture', 20.00, 3.0, 'World-famous art museum'),
    (2, 'Colosseum Tour', 'sightseeing', 25.00, 2.0, 'Ancient Roman amphitheater'),
    (2, 'Roman Food Tour', 'food', 45.00, 3.0, 'Guided tasting tour through local trattorias'),
    (3, 'Grand Palace Tour', 'sightseeing', 15.00, 2.0, 'Historic royal palace complex'),
    (3, 'Street Food Tour', 'food', 20.00, 2.5, 'Sample Bangkok street food favorites'),
    (4, 'Sagrada Familia Visit', 'sightseeing', 26.00, 2.0, 'Gaudi''s unfinished basilica'),
    (5, 'Shibuya & Shinjuku Walk', 'sightseeing', 0.00, 3.0, 'Self-guided city exploration'),
    (6, 'Beach Day at Baga', 'adventure', 10.00, 4.0, 'Water sports and beach relaxation');
