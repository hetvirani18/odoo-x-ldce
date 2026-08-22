const cityService = require('../services/city.service');
const CityRepository = require('../repositories/city.repository');
const { toCityView } = require('../models/city.model');

/**
 * @param {string} query
 */
async function searchCities(query) {
    const results = await cityService.searchCities(query || '');
    return results.map((c) => toCityView(c));
}

/**
 * @param {number} id
 */
async function getCityById(id) {
    const city = await CityRepository.findById(id);
    return toCityView(city);
}

module.exports = { searchCities, getCityById };
