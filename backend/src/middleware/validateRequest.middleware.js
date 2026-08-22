const { ERRORS } = require('../utils/AppError');

function validateRequest({ body, query, params }) {
    return (req, res, next) => {
        if (body) {
            const parsed = body.safeParse(req.body);
            if (!parsed.success) return next(ERRORS.VALIDATION_ERROR);
            req.body = parsed.data;
        }
        if (query) {
            const parsed = query.safeParse(req.query);
            if (!parsed.success) return next(ERRORS.VALIDATION_ERROR);
            req.query = parsed.data;
        }
        if (params) {
            const parsed = params.safeParse(req.params);
            if (!parsed.success) return next(ERRORS.VALIDATION_ERROR);
            req.params = parsed.data;
        }
        next();
    };
}

module.exports = validateRequest;
