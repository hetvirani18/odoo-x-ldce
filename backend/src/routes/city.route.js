const { Router } = require('express');
const { z } = require('zod');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest.middleware');
const { successResponse } = require('../utils/response');
const { searchCities, getCityById } = require('../controllers/city.controller');
const { getActivitiesByCity } = require('../controllers/activity.controller');

const SCHEMA = {
    SEARCH: z.object({
        q: z.string().optional(),
    }),
    ACTIVITIES_QUERY: z.object({
        category: z.string().optional(),
        maxCost: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
    }),
};

const cityRouter = Router();

// GET /api/cities/search?q=
cityRouter.get(
    '/search',
    authenticate,
    validateRequest({ query: SCHEMA.SEARCH }),
    asyncHandler(async (req, res) => {
        const query = req.query.q || '';
        const cities = await searchCities(query);
        res.json(successResponse(cities, 'Cities fetched successfully'));
    })
);

// GET /api/cities/:cityId/activities
cityRouter.get(
    '/:cityId/activities',
    authenticate,
    validateRequest({ query: SCHEMA.ACTIVITIES_QUERY }),
    asyncHandler(async (req, res) => {
        const cityId = Number(req.params.cityId);
        const activities = await getActivitiesByCity(cityId, req.query);
        res.json(successResponse(activities, 'City activities fetched successfully'));
    })
);

// GET /api/cities/:id
cityRouter.get(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const cityId = Number(req.params.id);
        const city = await getCityById(cityId);
        res.json(successResponse(city, 'City details fetched successfully'));
    })
);

module.exports = cityRouter;
