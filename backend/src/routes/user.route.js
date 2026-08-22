const { Router } = require('express');
const { z } = require('zod');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest.middleware');
const { successResponse } = require('../utils/response');
const { getMe, updateMe, deleteMe } = require('../controllers/user.controller');

const SCHEMA = {
    UPDATE_USER: z.object({
        name: z.string().min(1, 'Name cannot be empty').optional(),
        photo_url: z.string().url('Invalid photo URL').nullable().optional(),
        language: z.string().min(2).max(10).optional(),
    }),
};

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get(
    '/me',
    asyncHandler(async (req, res) => {
        const user = await getMe(req.user.id);
        res.json(successResponse({ user }, 'User profile retrieved successfully'));
    })
);

userRouter.put(
    '/me',
    validateRequest({ body: SCHEMA.UPDATE_USER }),
    asyncHandler(async (req, res) => {
        const user = await updateMe(req.user.id, req.body);
        res.json(successResponse({ user }, 'User profile updated successfully'));
    })
);

userRouter.delete(
    '/me',
    asyncHandler(async (req, res) => {
        await deleteMe(res, req.user.id);
        res.json(successResponse(null, 'User account deleted successfully'));
    })
);

module.exports = userRouter;
