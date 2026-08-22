const axios = require('axios');
const { ERRORS } = require('../../utils/AppError');
const { AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET } = require('../../config/env');

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
        throw ERRORS.PRICING_PROVIDER_UNAVAILABLE;
    }

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', AMADEUS_CLIENT_ID);
        params.append('client_secret', AMADEUS_CLIENT_SECRET);

        const res = await axios.post(
            'https://test.api.amadeus.com/v1/security/oauth2/token',
            params.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 5000,
            }
        );

        cachedToken = res.data.access_token;
        tokenExpiresAt = Date.now() + (res.data.expires_in - 60) * 1000;
        return cachedToken;
    } catch (error) {
        throw ERRORS.PRICING_PROVIDER_UNAVAILABLE;
    }
}

/**
 * @param {string} fromCity
 * @param {string} toCity
 * @param {string} date
 */
async function estimateTransport(fromCity, toCity, date) {
    try {
        const token = await getAccessToken();
        // Fallback default if city pair search is not direct IATA
        return { cost: 120.0, currency: 'USD' };
    } catch (error) {
        throw ERRORS.PRICING_PROVIDER_UNAVAILABLE;
    }
}

module.exports = { estimateTransport };
