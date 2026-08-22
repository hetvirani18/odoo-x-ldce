const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const { successResponse } = require('../utils/response');
const { getTripBudget, getTripExpenses } = require('../controllers/budget.controller');
const { shareTrip, unshareTrip } = require('../controllers/share.controller');

const tripRouter = Router();

// GET /api/trips/:tripId/budget
tripRouter.get(
    '/:tripId/budget',
    authenticate,
    asyncHandler(async (req, res) => {
        const tripId = Number(req.params.tripId);
        const budget = await getTripBudget(tripId, req.user.id);
        res.json(successResponse(budget, 'Trip budget calculated successfully'));
    })
);

// GET /api/trips/:tripId/expenses
tripRouter.get(
    '/:tripId/expenses',
    authenticate,
    asyncHandler(async (req, res) => {
        const tripId = Number(req.params.tripId);
        const expenses = await getTripExpenses(tripId, req.user.id);
        res.json(successResponse(expenses, 'Trip expenses breakdown fetched successfully'));
    })
);

// POST /api/trips/:id/share
tripRouter.post(
    '/:id/share',
    authenticate,
    asyncHandler(async (req, res) => {
        const tripId = Number(req.params.id);
        const result = await shareTrip(tripId, req.user.id);
        res.json(successResponse(result, 'Trip shared successfully'));
    })
);

// DELETE /api/trips/:id/share
tripRouter.delete(
    '/:id/share',
    authenticate,
    asyncHandler(async (req, res) => {
        const tripId = Number(req.params.id);
        const result = await unshareTrip(tripId, req.user.id);
        res.json(successResponse(result, 'Trip share revoked successfully'));
    })
);

module.exports = tripRouter;
