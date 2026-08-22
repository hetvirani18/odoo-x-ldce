const adminRepo = require('../repositories/admin.repository');
const userRepo = require('../repositories/user.repository');
const { toUserView } = require('../models/user.model');

/**
 * Fetch platform statistics and top rankings concurrently
 */
async function getStats() {
    const [total_users, total_trips, top_cities, top_activities] = await Promise.all([
        adminRepo.countUsers(),
        adminRepo.countTrips(),
        adminRepo.topCitiesByStops(5),
        adminRepo.topActivitiesByBookings(5),
    ]);

    return {
        total_users,
        total_trips,
        top_cities,
        top_activities,
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
