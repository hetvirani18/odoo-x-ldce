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
    ('Goa', 'India', 15.2993, 74.1240, 'low', 80),
    ('Ahmedabad', 'India', 23.0225, 72.5714, 'low', 85),
    ('Mumbai', 'India', 19.0760, 72.8777, 'medium', 88),
    ('Delhi', 'India', 28.6139, 77.2090, 'low', 87),
    ('London', 'United Kingdom', 51.5074, -0.1278, 'high', 94),
    ('New York', 'United States', 40.7128, -74.0060, 'high', 96),
    ('Dubai', 'United Arab Emirates', 25.2048, 55.2708, 'high', 91);

INSERT INTO activities (city_id, name, category, cost, duration_hours, description) VALUES
    -- Paris (city_id: 1)
    (1, 'Eiffel Tower Visit', 'sightseeing', 30.00, 2.5, 'Iconic tower with panoramic city views'),
    (1, 'Louvre Museum Tour', 'culture', 20.00, 3.0, 'World-famous art museum'),
    (1, 'Seine River Sunset Cruise', 'sightseeing', 25.00, 1.5, 'Relaxing cruise along the Seine with city landmarks view'),
    (1, 'Montmartre & Sacre-Coeur Walking Tour', 'culture', 18.00, 2.0, 'Explore the bohemian district and historic basilica'),
    (1, 'Versailles Palace Half-Day Tour', 'sightseeing', 45.00, 4.0, 'Royal palace and garden tour with priority access'),
    (1, 'French Bakery & Croissant Masterclass', 'food', 55.00, 2.5, 'Hands-on pastry making with a French chef'),

    -- Rome (city_id: 2)
    (2, 'Colosseum Tour', 'sightseeing', 25.00, 2.0, 'Ancient Roman amphitheater'),
    (2, 'Roman Food Tour', 'food', 45.00, 3.0, 'Guided tasting tour through local trattorias'),
    (2, 'Vatican Museums & Sistine Chapel', 'culture', 35.00, 3.5, 'Exclusive guided tour of the Vatican treasures'),
    (2, 'Trastevere Evening Food & Wine Tour', 'food', 50.00, 3.0, 'Authentic local cuisine and Italian wine tasting'),
    (2, 'Trevi Fountain & Spanish Steps Walk', 'sightseeing', 0.00, 1.5, 'Self-guided historic center walk'),

    -- Bangkok (city_id: 3)
    (3, 'Grand Palace Tour', 'sightseeing', 15.00, 2.0, 'Historic royal palace complex'),
    (3, 'Street Food Tour', 'food', 20.00, 2.5, 'Sample Bangkok street food favorites'),
    (3, 'Floating Market & Railway Market Tour', 'adventure', 35.00, 5.0, 'Traditional canal market experience'),
    (3, 'Chao Phraya Dinner Cruise', 'food', 40.00, 2.5, 'Buffet dinner with Thai cultural dance on the river'),
    (3, 'Wat Pho Reclining Buddha Visit', 'culture', 10.00, 1.5, 'Sacred temple complex and traditional Thai massage center'),

    -- Barcelona (city_id: 4)
    (4, 'Sagrada Familia Visit', 'sightseeing', 26.00, 2.0, 'Gaudi''s unfinished basilica'),
    (4, 'Park Guell Guided Tour', 'sightseeing', 22.00, 2.0, 'Whimsical mosaics and panoramic views by Gaudi'),
    (4, 'Gothic Quarter Tapas Crawl', 'food', 40.00, 3.0, 'Taste delicious Catalan tapas and local drinks'),
    (4, 'Barceloneta Beach Paddleboarding', 'adventure', 30.00, 2.0, 'Water adventure along the Mediterranean coastline'),
    (4, 'Flamenco Show at Tablao Cordobes', 'culture', 45.00, 1.5, 'Passionate traditional Spanish flamenco performance'),

    -- Tokyo (city_id: 5)
    (5, 'Shibuya & Shinjuku Walk', 'sightseeing', 0.00, 3.0, 'Self-guided city exploration'),
    (5, 'Tokyo Skytree & Asakusa Senso-ji Tour', 'sightseeing', 28.00, 3.0, 'Historic temple visit combined with modern observation tower'),
    (5, 'Tsukiji Outer Market Food Tour', 'food', 45.00, 2.5, 'Fresh sushi tasting and seafood street food exploration'),
    (5, 'teamLab Planets Digital Art Museum', 'culture', 32.00, 2.0, 'Immersive digital art exhibition with water and light installations'),
    (5, 'Akihabara Gaming & Anime Tour', 'adventure', 20.00, 2.0, 'Explore the heart of Japanese tech and otaku culture'),
    (5, 'Traditional Japanese Tea Ceremony', 'culture', 35.00, 1.5, 'Authentic matcha preparation in a historic garden tea house'),

    -- Goa (city_id: 6)
    (6, 'Beach Day at Baga', 'adventure', 10.00, 4.0, 'Water sports and beach relaxation'),
    (6, 'Dudhsagar Waterfalls Trek & Jeep Safari', 'adventure', 30.00, 6.0, 'Spectacular four-tiered waterfall excursion in the jungle'),
    (6, 'Old Goa Heritage Churches Walking Tour', 'culture', 12.00, 2.5, 'Portuguese colonial architecture and historic cathedrals'),
    (6, 'Goan Spice Plantation Tour & Traditional Lunch', 'food', 20.00, 3.0, 'Guided spice garden walk with authentic local buffet');
