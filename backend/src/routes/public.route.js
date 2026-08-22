const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/response');
const { getPublicTrip, listPublicTrips } = require('../controllers/share.controller');

const publicRouter = Router();

// GET /api/public/trips
publicRouter.get(
    '/trips',
    asyncHandler(async (req, res) => {
        const trips = await listPublicTrips();
        res.json(successResponse(trips, 'Public trips fetched successfully'));
    })
);

// GET /api/public/trips/:shareToken
publicRouter.get(
    '/trips/:shareToken',
    asyncHandler(async (req, res) => {
        const { shareToken } = req.params;
        const itinerary = await getPublicTrip(shareToken);
        res.json(successResponse(itinerary, 'Public trip itinerary fetched successfully'));
    })
);

module.exports = publicRouter;
