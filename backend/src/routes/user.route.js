const { Router } = require('express');
const { z } = require('zod');
const multer = require('multer');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validateRequest.middleware');
const { successResponse } = require('../utils/response');
const { ERRORS } = require('../utils/AppError');
const { getMe, updateMe, uploadPhoto, deleteMe } = require('../controllers/user.controller');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(ERRORS.INVALID_FILE_TYPE, false);
        }
        cb(null, true);
    },
});

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

userRouter.post(
    '/me/photo',
    upload.single('photo'),
    asyncHandler(async (req, res) => {
        const user = await uploadPhoto(req.user.id, req.file);
        res.json(successResponse({ user }, 'Profile photo uploaded successfully'));
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
