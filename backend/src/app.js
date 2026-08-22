const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { CORS_ORIGIN } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const limiter = require('./middleware/ratelimit.middleware');
const { successResponse } = require('./utils/response');

const app = express();

app.use(limiter);
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
    res.json(successResponse({ status: 'ok' }, 'GlobeTrotter API is running'));
});

// Routers
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/users', require('./routes/user.route'));
app.use('/api/admin', require('./routes/admin.route'));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
