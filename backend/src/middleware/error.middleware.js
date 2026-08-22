const { AppError } = require('../utils/AppError');
const { errorResponse } = require('../utils/response');

function errorHandler(error, req, res, next) {
    if (error instanceof AppError) {
        // Expected client errors (bad input, missing/expired auth, not found, etc.) aren't
        // logged as crashes — only genuine 5xx failures get the full stack trace.
        if (error.statusCode >= 500) {
            console.error(error);
        }
        return res.status(error.statusCode).json(errorResponse(error.message, error.code));
    }

    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json(errorResponse('Invalid authentication token', 20002));
    }
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json(errorResponse('Duplicate entry detected', 10001));
    }
    if (error.name === 'MulterError') {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json(errorResponse('File size exceeds the 5MB limit', 10008));
        }
        return res.status(400).json(errorResponse(error.message, 10009));
    }
    if (error instanceof SyntaxError && 'body' in error) {
        return res.status(400).json(errorResponse('Invalid JSON in request body', 10002));
    }

    return res.status(500).json(errorResponse('Internal server error', 10000));
}

function notFoundHandler(req, res) {
    res.status(404).json(errorResponse(`Route ${req.method} ${req.path} not found`, 10004));
}

module.exports = { errorHandler, notFoundHandler };
