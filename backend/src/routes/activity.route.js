const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const { successResponse } = require('../utils/response');
const { getActivityById } = require('../controllers/activity.controller');

const activityRouter = Router();

// GET /api/activities/:id
activityRouter.get(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const activityId = Number(req.params.id);
        const activity = await getActivityById(activityId);
        res.json(successResponse(activity, 'Activity details fetched successfully'));
    })
);

module.exports = activityRouter;
