const { Router } = require('express');
const { z } = require('zod');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest.middleware');
const { successResponse } = require('../utils/response');
const {
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
} = require('../controllers/auth.controller');

const SCHEMA = {
    SIGNUP: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        photo_url: z.string().url('Invalid photo URL').optional(),
    }),
    LOGIN: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
    FORGOT_PASSWORD: z.object({
        email: z.string().email('Invalid email address'),
    }),
    RESET_PASSWORD: z.object({
        token: z.string().min(1, 'Token is required'),
        new_password: z.string().min(6, 'Password must be at least 6 characters'),
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

authRouter.post(
    '/forgot-password',
    validateRequest({ body: SCHEMA.FORGOT_PASSWORD }),
    asyncHandler(async (req, res) => {
        await forgotPassword(req.body.email);
        res.json(
            successResponse(null, 'If that email exists, a password reset link has been sent')
        );
    })
);

authRouter.post(
    '/reset-password',
    validateRequest({ body: SCHEMA.RESET_PASSWORD }),
    asyncHandler(async (req, res) => {
        await resetPassword(req.body);
        res.json(successResponse(null, 'Password has been reset successfully'));
    })
);

module.exports = authRouter;
