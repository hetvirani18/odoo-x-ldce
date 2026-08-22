const { db } = require('../database/db');

/**
 * Count total registered users
 * @returns {Promise<number>}
 */
async function countUsers() {
    const [[row]] = await db.query('SELECT COUNT(*) AS total_users FROM users');
    return row ? Number(row.total_users) : 0;
}

/**
 * Count total created trips
 * @returns {Promise<number>}
 */
async function countTrips() {
    const [[row]] = await db.query('SELECT COUNT(*) AS total_trips FROM trips');
    return row ? Number(row.total_trips) : 0;
}

/**
 * Get top cities ordered by number of stops
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function topCitiesByStops(limit = 5) {
    const [rows] = await db.query(
        `SELECT c.id, c.name, c.country, COUNT(s.id) AS stop_count
         FROM cities c
         JOIN stops s ON c.id = s.city_id
         GROUP BY c.id
         ORDER BY stop_count DESC
         LIMIT ?`,
        [limit]
    );
    return rows;
}

/**
 * Get top activities ordered by number of scheduled bookings
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function topActivitiesByBookings(limit = 5) {
    const [rows] = await db.query(
        `SELECT a.id, a.name, a.category, COUNT(ta.id) AS booking_count
         FROM activities a
         JOIN trip_activities ta ON a.id = ta.activity_id
         GROUP BY a.id
         ORDER BY booking_count DESC
         LIMIT ?`,
        [limit]
    );
    return rows;
}

module.exports = {
    countUsers,
    countTrips,
    topCitiesByStops,
    topActivitiesByBookings,
};
