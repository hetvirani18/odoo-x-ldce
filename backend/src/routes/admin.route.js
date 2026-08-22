const { Router } = require('express');
const { z } = require('zod');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest.middleware');
const { successResponse } = require('../utils/response');
const { getStats, listUsers, updateUserRole } = require('../controllers/admin.controller');

const SCHEMA = {
    UPDATE_ROLE: z.object({
        role: z.enum(['user', 'admin'], {
            errorMap: () => ({ message: "Role must be either 'user' or 'admin'" }),
        }),
    }),
};

const adminRouter = Router();

// Protect all admin endpoints
adminRouter.use(authenticate, requireAdmin);

adminRouter.get(
    '/stats',
    asyncHandler(async (req, res) => {
        const stats = await getStats();
        res.json(successResponse(stats, 'Admin platform statistics retrieved successfully'));
    })
);

adminRouter.get(
    '/users',
    asyncHandler(async (req, res) => {
        const result = await listUsers(req.query);
        res.json(successResponse(result, 'Users list retrieved successfully'));
    })
);

adminRouter.patch(
    '/users/:id/role',
    validateRequest({ body: SCHEMA.UPDATE_ROLE }),
    asyncHandler(async (req, res) => {
        const user = await updateUserRole(Number(req.params.id), req.body.role);
        res.json(successResponse({ user }, 'User role updated successfully'));
    })
);

module.exports = adminRouter;
