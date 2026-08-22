const openTripMapProvider = require('./activityProvider/openTripMapProvider');
const seedProvider = require('./activityProvider/seedActivityProvider');
const CityRepository = require('../repositories/city.repository');
const ActivityRepository = require('../repositories/activity.repository');

/**
 * Generate category-specific dynamic activity templates for any city
 */
function generateDynamicCityActivities(cityName, costIndex = 'medium') {
    const multiplier = costIndex === 'high' ? 1.4 : costIndex === 'low' ? 0.6 : 1.0;

    return [
        {
            name: `${cityName} City Highlights & Landmark Tour`,
            category: 'sightseeing',
            cost: Math.round(25.0 * multiplier),
            duration_hours: 2.5,
            description: `Guided tour of the most famous landmarks, architecture, and viewpoints in ${cityName}.`,
        },
        {
            name: `${cityName} Cultural Heritage & Historic Museum`,
            category: 'culture',
            cost: Math.round(20.0 * multiplier),
            duration_hours: 3.0,
            description: `Explore the historic heritage and world-class artifacts of ${cityName}.`,
        },
        {
            name: `Authentic ${cityName} Food & Street Market Walk`,
            category: 'food',
            cost: Math.round(40.0 * multiplier),
            duration_hours: 2.5,
            description: `Taste signature regional delicacies and street dishes from local vendors in ${cityName}.`,
        },
        {
            name: `${cityName} Sunset Cruise & Riverfront Experience`,
            category: 'adventure',
            cost: Math.round(35.0 * multiplier),
            duration_hours: 2.0,
            description: `Enjoy scenic panoramic skyline views during sunset in ${cityName}.`,
        },
        {
            name: `Hidden Gems & Local Neighborhoods in ${cityName}`,
            category: 'sightseeing',
            cost: Math.round(15.0 * multiplier),
            duration_hours: 2.0,
            description: `Venture beyond the tourist trails into the vibrant, authentic districts of ${cityName}.`,
        },
    ];
}

/**
 * @param {number} cityId
 * @param {{ category?: string, maxCost?: number }} [filters]
 */
async function getActivitiesForCity(cityId, filters = {}) {
    const city = await CityRepository.findById(cityId);
    let activities = await seedProvider.findByCityId(cityId, filters);

    // 1. If OpenTripMap live provider is active, fetch real API results
    try {
        const liveResults = await openTripMapProvider.search(city.name, filters);
        for (const item of liveResults) {
            if (!activities.some((c) => c.name.toLowerCase() === item.name.toLowerCase())) {
                const created = await ActivityRepository.create({
                    cityId,
                    name: item.name,
                    category: item.category || 'sightseeing',
                    cost: item.cost || (item.category === 'food' ? 40 : 25),
                    durationHours: item.duration_hours || 2.0,
                    description: item.description,
                    imageUrl: item.image_url,
                });
                activities.push(created);
            }
        }
    } catch (error) {
        // Provider unavailable or offline
    }

    // 2. If city has fewer than 3 activities, dynamically populate realistic activities for this city
    if (activities.length < 3) {
        const templates = generateDynamicCityActivities(city.name, city.cost_index);
        for (const tpl of templates) {
            if (!activities.some((c) => c.name.toLowerCase() === tpl.name.toLowerCase())) {
                try {
                    const created = await ActivityRepository.create({
                        cityId,
                        name: tpl.name,
                        category: tpl.category,
                        cost: tpl.cost,
                        durationHours: tpl.duration_hours,
                        description: tpl.description,
                        imageUrl: null,
                    });
                    activities.push(created);
                } catch (err) {
                    // Ignore duplicate key or insert error
                }
            }
        }
    }

    // Apply any filter constraints
    if (filters.category) {
        activities = activities.filter((a) => a.category === filters.category);
    }
    if (filters.maxCost != null) {
        activities = activities.filter((a) => Number(a.cost || 0) <= Number(filters.maxCost));
    }

    return activities;
}

module.exports = { getActivitiesForCity };
