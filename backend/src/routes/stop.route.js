const { Router } = require('express');
const { z } = require('zod');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest.middleware');
const { successResponse } = require('../utils/response');
const {
    addStop,
    listStops,
    updateStop,
    deleteStop,
    reorderStops,
} = require('../controllers/itinerary.controller');

const SCHEMA = {
    ADD_STOP: z.object({
        city_id: z.number().int().positive('city_id must be a positive integer'),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be in YYYY-MM-DD format'),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be in YYYY-MM-DD format'),
        order_index: z.number().int().nonnegative().optional(),
    }),
    UPDATE_STOP: z.object({
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be in YYYY-MM-DD format').optional(),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be in YYYY-MM-DD format').optional(),
        order_index: z.number().int().nonnegative().optional(),
        city_id: z.number().int().positive().optional(),
    }),
    REORDER_STOPS: z.object({
        stop_ids: z.array(z.number().int().positive()).min(1, 'stop_ids array cannot be empty'),
    }),
};

// Router mounted on /api/stops
const stopRouter = Router();

stopRouter.put(
    '/:id',
    authenticate,
    validateRequest({ body: SCHEMA.UPDATE_STOP }),
    asyncHandler(async (req, res) => {
        const stop = await updateStop(Number(req.params.id), req.user.id, req.body);
        res.json(successResponse(stop, 'Stop updated successfully'));
    })
);

stopRouter.delete(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        await deleteStop(Number(req.params.id), req.user.id);
        res.json(successResponse(null, 'Stop deleted successfully'));
    })
);

// Router mounted on /api/trips/:tripId/stops
const tripStopsRouter = Router({ mergeParams: true });

tripStopsRouter.post(
    '/',
    authenticate,
    validateRequest({ body: SCHEMA.ADD_STOP }),
    asyncHandler(async (req, res) => {
        const stop = await addStop(Number(req.params.tripId), req.user.id, req.body);
        res.status(201).json(successResponse(stop, 'Stop added successfully'));
    })
);

tripStopsRouter.get(
    '/',
    authenticate,
    asyncHandler(async (req, res) => {
        const stops = await listStops(Number(req.params.tripId), req.user.id);
        res.json(successResponse(stops, 'Stops fetched successfully'));
    })
);

tripStopsRouter.put(
    '/reorder',
    authenticate,
    validateRequest({ body: SCHEMA.REORDER_STOPS }),
    asyncHandler(async (req, res) => {
        const stops = await reorderStops(Number(req.params.tripId), req.user.id, req.body);
        res.json(successResponse(stops, 'Stops reordered successfully'));
    })
);

module.exports = { stopRouter, tripStopsRouter };
