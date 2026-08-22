const CostEstimateRepository = require('../../repositories/costEstimate.repository');

const DEFAULT_RATES = {
    low: { perNightRate: 35.0, perDayMealRate: 15.0 },
    medium: { perNightRate: 80.0, perDayMealRate: 30.0 },
    high: { perNightRate: 180.0, perDayMealRate: 60.0 },
};

/**
 * @param {'low'|'medium'|'high'} costIndex
 */
async function rateFor(costIndex) {
    try {
        const rates = await CostEstimateRepository.getCostRates();
        if (rates[costIndex]) {
            return rates[costIndex];
        }
    } catch (error) {
        // Fall back to default constants
    }
    return DEFAULT_RATES[costIndex] || DEFAULT_RATES.medium;
}

module.exports = { rateFor };
