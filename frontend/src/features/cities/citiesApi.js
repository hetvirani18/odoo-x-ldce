import { api } from '../../app/api';

export const citiesApi = api.injectEndpoints({
    endpoints: (build) => ({
        searchCities: build.query({
            query: (searchQuery = '') => `/cities/search?q=${encodeURIComponent(searchQuery)}`,
            transformResponse: (res) => res.data,
        }),
    }),
});

export const { useSearchCitiesQuery } = citiesApi;
