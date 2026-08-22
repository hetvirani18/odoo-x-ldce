const jwt = require('jsonwebtoken');
const { ERRORS } = require('../utils/AppError');
const { JWT_SECRET } = require('../config/env');

// Access-token-only auth: the JWT lives in an httpOnly cookie set on login/signup — no
// Authorization header, no refresh token. See docs/BACKEND_GUIDE.md §11.
function authenticate(req, res, next) {
    const token = req.cookies.access_token;
    if (!token) {
        return next(ERRORS.NO_TOKEN_PROVIDED);
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET); // { id, email, role }
        next();
    } catch (error) {
        next(ERRORS.INVALID_AUTH_TOKEN);
    }
}

// Must come AFTER authenticate in the middleware chain — used only by /api/admin/* routes
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return next(ERRORS.ADMIN_ONLY_ROUTE);
    }
    next();
}

module.exports = { authenticate, requireAdmin };
