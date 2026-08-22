const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { CORS_ORIGIN } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const limiter = require('./middleware/ratelimit.middleware');
const { successResponse } = require('./utils/response');

const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const adminRouter = require('./routes/admin.route');
const tripRouter = require('./routes/trip.route');
const { stopRouter } = require('./routes/stop.route');
const cityRouter = require('./routes/city.route');
const activityRouter = require('./routes/activity.route');
const publicRouter = require('./routes/public.route');

const app = express();

app.use(limiter);
const allowedOrigins = [CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'].filter(Boolean);
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
    res.json(successResponse({ status: 'ok' }, 'GlobeTrotter API is running'));
});

// Routers
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/trips', tripRouter);
app.use('/api/stops', stopRouter);
app.use('/api/cities', cityRouter);
app.use('/api/activities', activityRouter);
app.use('/api/public', publicRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
