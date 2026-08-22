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

/**
 * Bucket a set of timestamps into weekly counts, oldest week first
 * @param {Array<{created_at: Date}>} rows
 * @param {number} weeks
 * @returns {number[]}
 */
function bucketByWeek(rows, weeks) {
    const buckets = new Array(weeks).fill(0);
    const now = Date.now();
    for (const { created_at } of rows) {
        const daysAgo = Math.floor((now - new Date(created_at).getTime()) / 86400000);
        const weekIndex = weeks - 1 - Math.floor(daysAgo / 7);
        if (weekIndex >= 0 && weekIndex < weeks) buckets[weekIndex] += 1;
    }
    return buckets;
}

/**
 * Count trips created per week over the trailing window
 * @param {number} weeks
 * @returns {Promise<number[]>}
 */
async function weeklyTripCounts(weeks = 8) {
    const [rows] = await db.query(
        'SELECT created_at FROM trips WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)',
        [weeks]
    );
    return bucketByWeek(rows, weeks);
}

/**
 * Count new user signups per week over the trailing window
 * @param {number} weeks
 * @returns {Promise<number[]>}
 */
async function weeklyUserSignups(weeks = 8) {
    const [rows] = await db.query(
        'SELECT created_at FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)',
        [weeks]
    );
    return bucketByWeek(rows, weeks);
}

/**
 * Count trips grouped by the season of their start date
 * @returns {Promise<Array<{label: string, value: number}>>}
 */
async function tripsBySeason() {
    const [rows] = await db.query(
        `SELECT
            CASE
                WHEN MONTH(start_date) IN (3, 4, 5) THEN 'Spring'
                WHEN MONTH(start_date) IN (6, 7, 8) THEN 'Summer'
                WHEN MONTH(start_date) IN (9, 10, 11) THEN 'Autumn'
                ELSE 'Winter'
            END AS season,
            COUNT(*) AS count
         FROM trips
         GROUP BY season`
    );
    const bySeason = Object.fromEntries(rows.map((r) => [r.season, Number(r.count)]));
    return ['Spring', 'Summer', 'Autumn', 'Winter'].map((label) => ({
        label,
        value: bySeason[label] || 0,
    }));
}

/**
 * Count trips grouped by lifecycle status (upcoming/ongoing/completed)
 * @returns {Promise<Array<{label: string, value: number}>>}
 */
async function tripsByStatus() {
    const [rows] = await db.query(
        `SELECT
            CASE
                WHEN end_date < CURDATE() THEN 'Completed'
                WHEN start_date > CURDATE() THEN 'Upcoming'
                ELSE 'Ongoing'
            END AS status,
            COUNT(*) AS count
         FROM trips
         GROUP BY status`
    );
    const byStatus = Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
    return ['Upcoming', 'Ongoing', 'Completed'].map((label) => ({
        label,
        value: byStatus[label] || 0,
    }));
}

/**
 * Count users grouped by role
 * @returns {Promise<Array<{label: string, value: number}>>}
 */
async function usersByRole() {
    const [rows] = await db.query('SELECT role, COUNT(*) AS count FROM users GROUP BY role');
    const byRole = Object.fromEntries(rows.map((r) => [r.role, Number(r.count)]));
    return [
        { label: 'Traveler', value: byRole.user || 0 },
        { label: 'Admin', value: byRole.admin || 0 },
    ];
}

module.exports = {
    countUsers,
    countTrips,
    topCitiesByStops,
    topActivitiesByBookings,
    weeklyTripCounts,
    weeklyUserSignups,
    tripsBySeason,
    tripsByStatus,
    usersByRole,
};
