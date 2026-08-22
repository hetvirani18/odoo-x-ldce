const { db } = require('./src/database/db');

async function seed() {
    console.log('Seeding cost_rates, cities, and activities...');

    // 1. Cost Rates
    await db.query(`
        INSERT INTO cost_rates (cost_index, per_night_rate, per_day_meal_rate) VALUES
            ('low',    35.00, 15.00),
            ('medium', 80.00, 30.00),
            ('high',  180.00, 60.00)
        ON DUPLICATE KEY UPDATE per_night_rate = VALUES(per_night_rate), per_day_meal_rate = VALUES(per_day_meal_rate);
    `);
    console.log('✔ cost_rates seeded');

    // 2. Cities
    await db.query(`
        INSERT INTO cities (id, name, country, lat, lng, cost_index, popularity) VALUES
            (1, 'Paris', 'France', 48.856613, 2.352222, 'high', 95),
            (2, 'Rome', 'Italy', 41.902782, 12.496366, 'medium', 90),
            (3, 'Bangkok', 'Thailand', 13.756331, 100.501762, 'low', 85),
            (4, 'Barcelona', 'Spain', 41.385063, 2.173404, 'medium', 88),
            (5, 'Tokyo', 'Japan', 35.689487, 139.691711, 'high', 92),
            (6, 'Goa', 'India', 15.2993, 74.1240, 'low', 80)
        ON DUPLICATE KEY UPDATE name = VALUES(name), country = VALUES(country);
    `);
    console.log('✔ cities seeded');

    // 3. Activities
    await db.query(`
        INSERT INTO activities (id, city_id, name, category, cost, duration_hours, description) VALUES
            (1, 1, 'Eiffel Tower Visit', 'sightseeing', 30.00, 2.5, 'Iconic tower with panoramic city views'),
            (2, 1, 'Louvre Museum Tour', 'culture', 20.00, 3.0, 'World-famous art museum'),
            (3, 2, 'Colosseum Tour', 'sightseeing', 25.00, 2.0, 'Ancient Roman amphitheater'),
            (4, 2, 'Roman Food Tour', 'food', 45.00, 3.0, 'Guided tasting tour through local trattorias'),
            (5, 3, 'Grand Palace Tour', 'sightseeing', 15.00, 2.0, 'Historic royal palace complex'),
            (6, 3, 'Street Food Tour', 'food', 20.00, 2.5, 'Sample Bangkok street food favorites'),
            (7, 4, 'Sagrada Familia Visit', 'sightseeing', 26.00, 2.0, 'Gaudí unfinished basilica'),
            (8, 5, 'Shibuya & Shinjuku Walk', 'sightseeing', 0.00, 3.0, 'Self-guided city exploration'),
            (9, 6, 'Beach Day at Baga', 'adventure', 10.00, 4.0, 'Water sports and beach relaxation')
        ON DUPLICATE KEY UPDATE name = VALUES(name);
    `);
    console.log('✔ activities seeded');

    console.log('\n--- ALL DATABASE SEEDING COMPLETED SUCCESSFULLY! ---');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed Error:', err);
    process.exit(1);
});
