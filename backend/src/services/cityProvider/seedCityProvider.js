const CityRepository = require('../../repositories/city.repository');

/**
 * @param {string} query
 */
async function search(query) {
    if (!query || query.trim() === '') {
        return CityRepository.getAll();
    }
    return CityRepository.searchByName(query.trim());
}

module.exports = { search };
