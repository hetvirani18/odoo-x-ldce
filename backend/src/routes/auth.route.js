const { Router } = require('express');
const { z } = require('zod');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest.middleware');
const { successResponse } = require('../utils/response');
const { signup, login, logout } = require('../controllers/auth.controller');

const SCHEMA = {
    SIGNUP: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
    LOGIN: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
};

const authRouter = Router();

authRouter.post(
    '/signup',
    validateRequest({ body: SCHEMA.SIGNUP }),
    asyncHandler(async (req, res) => {
        const user = await signup(res, req.body);
        res.status(201).json(successResponse({ user }, 'User registered successfully'));
    })
);

authRouter.post(
    '/login',
    validateRequest({ body: SCHEMA.LOGIN }),
    asyncHandler(async (req, res) => {
        const user = await login(res, req.body);
        res.json(successResponse({ user }, 'Logged in successfully'));
    })
);

authRouter.post(
    '/logout',
    authenticate,
    asyncHandler(async (req, res) => {
        logout(res);
        res.json(successResponse(null, 'Logged out successfully'));
    })
);

module.exports = authRouter;
