const { db } = require('../database/db');
const userRepo = require('../repositories/user.repository');
const { toUserView } = require('../models/user.model');

/**
 * Fetch platform statistics and top rankings
 */
async function getStats() {
    const [[userCountRow]] = await db.query('SELECT COUNT(*) AS total_users FROM users');
    const [[tripCountRow]] = await db.query('SELECT COUNT(*) AS total_trips FROM trips');

    const [topCities] = await db.query(`
        SELECT c.id, c.name, c.country, COUNT(s.id) AS stop_count
        FROM cities c
        JOIN stops s ON c.id = s.city_id
        GROUP BY c.id
        ORDER BY stop_count DESC
        LIMIT 5
    `);

    const [topActivities] = await db.query(`
        SELECT a.id, a.name, a.category, COUNT(ta.id) AS booking_count
        FROM activities a
        JOIN trip_activities ta ON a.id = ta.activity_id
        GROUP BY a.id
        ORDER BY booking_count DESC
        LIMIT 5
    `);

    return {
        total_users: userCountRow ? Number(userCountRow.total_users) : 0,
        total_trips: tripCountRow ? Number(tripCountRow.total_trips) : 0,
        top_cities: topCities,
        top_activities: topActivities,
    };
}

/**
 * List all users with pagination
 * @param {{ limit?: string|number, page?: string|number }} query
 */
async function listUsers(query = {}) {
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const page = Math.max(Number(query.page) || 1, 1);
    const offset = (page - 1) * limit;

    const users = await userRepo.listUsers({ limit, offset });
    return {
        users: users.map(toUserView),
        page,
        limit,
    };
}

/**
 * Update a user's role (promote/demote)
 * @param {number} userId
 * @param {'user'|'admin'} role
 */
async function updateUserRole(userId, role) {
    const updated = await userRepo.updateRole(userId, role);
    return toUserView(updated);
}

module.exports = {
    getStats,
    listUsers,
    updateUserRole,
};
