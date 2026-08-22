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
app.use('/api/cities', require('./routes/city.route'));
app.use('/api/activities', require('./routes/activity.route'));
app.use('/api/trips', require('./routes/trip.route'));
app.use('/api/public', require('./routes/public.route'));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
