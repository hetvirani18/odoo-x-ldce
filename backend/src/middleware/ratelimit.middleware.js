const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');
const { ERRORS } = require('../utils/AppError');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: errorResponse(ERRORS.RATE_LIMIT_EXCEEDED.message, ERRORS.RATE_LIMIT_EXCEEDED.code),
});

module.exports = limiter;
