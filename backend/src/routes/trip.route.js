const { Router } = require('express');
const { z } = require('zod');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest.middleware');
const { successResponse } = require('../utils/response');
const {
    createTrip,
    listTrips,
    getTrip,
    updateTrip,
    deleteTrip,
} = require('../controllers/trip.controller');
const { getTripBudget, getTripExpenses } = require('../controllers/budget.controller');
const { shareTrip, unshareTrip } = require('../controllers/share.controller');
const { tripStopsRouter } = require('./stop.route');

const SCHEMA = {
    CREATE_TRIP: z.object({
        name: z.string().trim().min(1, 'Trip name is required').max(200),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be in YYYY-MM-DD format'),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be in YYYY-MM-DD format'),
        description: z.string().optional().nullable(),
        cover_photo_url: z.string().url().optional().nullable().or(z.literal('')),
        is_public: z.boolean().optional(),
    }),
    UPDATE_TRIP: z.object({
        name: z.string().trim().min(1).max(200).optional(),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be in YYYY-MM-DD format').optional(),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be in YYYY-MM-DD format').optional(),
        description: z.string().optional().nullable(),
        cover_photo_url: z.string().url().optional().nullable().or(z.literal('')),
        is_public: z.boolean().optional(),
    }),
};

const tripRouter = Router();

tripRouter.post(
    '/',
    authenticate,
    validateRequest({ body: SCHEMA.CREATE_TRIP }),
    asyncHandler(async (req, res) => {
        const trip = await createTrip(req.user.id, req.body);
        res.status(201).json(successResponse(trip, 'Trip created successfully'));
    })
);

tripRouter.get(
    '/',
    authenticate,
    asyncHandler(async (req, res) => {
        const trips = await listTrips(req.user.id);
        res.json(successResponse(trips, 'Trips fetched successfully'));
    })
);

tripRouter.get(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const trip = await getTrip(Number(req.params.id), req.user.id);
        res.json(successResponse(trip, 'Trip fetched successfully'));
    })
);

tripRouter.put(
    '/:id',
    authenticate,
    validateRequest({ body: SCHEMA.UPDATE_TRIP }),
    asyncHandler(async (req, res) => {
        const trip = await updateTrip(Number(req.params.id), req.user.id, req.body);
        res.json(successResponse(trip, 'Trip updated successfully'));
    })
);

tripRouter.delete(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        await deleteTrip(Number(req.params.id), req.user.id);
        res.json(successResponse(null, 'Trip deleted successfully'));
    })
);

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

tripRouter.use('/:tripId/stops', tripStopsRouter);

module.exports = tripRouter;
