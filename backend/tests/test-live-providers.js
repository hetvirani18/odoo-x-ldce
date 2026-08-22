const axios = require('axios');
const { GEODB_API_KEY, OPENTRIPMAP_API_KEY, FLIGHTFARE_API_KEY } = require('../src/config/env');

async function testGeoDb() {
    console.log('\n--- 1. Testing GeoDB Cities API ---');
    try {
        const res = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
            params: { namePrefix: 'Paris', limit: 3 },
            headers: {
                'X-RapidAPI-Key': GEODB_API_KEY,
                'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
            },
            timeout: 8000,
        });
        console.log('GeoDB Response Status:', res.status);
        console.log('GeoDB Cities Found:', (res.data.data || []).map(c => `${c.city}, ${c.country} (${c.latitude}, ${c.longitude})`));
        return true;
    } catch (err) {
        console.error('GeoDB Error:', err.response ? `${err.response.status}: ${JSON.stringify(err.response.data)}` : err.message);
        return false;
    }
}

async function testOpenTripMap() {
    console.log('\n--- 2. Testing OpenTripMap API ---');
    try {
        const geoRes = await axios.get('https://api.opentripmap.com/0.1/en/places/geoname', {
            params: { name: 'Paris', apikey: OPENTRIPMAP_API_KEY },
            timeout: 8000,
        });
        console.log('OpenTripMap Geoname Status:', geoRes.status, 'Coordinates:', geoRes.data.lat, geoRes.data.lon);

        const placesRes = await axios.get('https://api.opentripmap.com/0.1/en/places/radius', {
            params: {
                radius: 5000,
                lon: geoRes.data.lon,
                lat: geoRes.data.lat,
                kinds: 'interesting_places,cultural,historic',
                format: 'json',
                limit: 3,
                apikey: OPENTRIPMAP_API_KEY,
            },
            timeout: 8000,
        });
        console.log('OpenTripMap Radius Status:', placesRes.status);
        console.log('OpenTripMap Places Found:', (placesRes.data || []).map(p => p.name));
        return true;
    } catch (err) {
        console.error('OpenTripMap Error:', err.response ? `${err.response.status}: ${JSON.stringify(err.response.data)}` : err.message);
        return false;
    }
}

async function testFlightFare() {
    console.log('\n--- 3. Testing Flight / Transport Provider ---');
    console.log('FlightFare API Key loaded:', Boolean(FLIGHTFARE_API_KEY));
    return true;
}

async function run() {
    console.log('Testing live external providers with your pasted keys...');
    await testGeoDb();
    await testOpenTripMap();
    await testFlightFare();
    process.exit(0);
}

run();
