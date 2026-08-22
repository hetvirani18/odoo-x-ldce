require('dotenv').config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'globetrotter';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// External services — optional, providers fall back to seeded data if unset
const GEODB_API_KEY = process.env.GEODB_API_KEY || '';
const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY || '';
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID || '';
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET || '';

// Email (forgot password) — no fallback, see docs/BACKEND_GUIDE.md §9.5
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@globetrotter.local';

module.exports = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CORS_ORIGIN,
    FRONTEND_URL,
    GEODB_API_KEY,
    OPENTRIPMAP_API_KEY,
    AMADEUS_CLIENT_ID,
    AMADEUS_CLIENT_SECRET,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM,
};
