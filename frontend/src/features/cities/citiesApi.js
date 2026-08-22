import { api } from '../../app/api';

export const citiesApi = api.injectEndpoints({
    endpoints: (build) => ({
        searchCities: build.query({
            query: (q = '') => ({
                url: '/cities/search',
                params: q ? { q } : undefined,
            }),
            transformResponse: (res) => res.data || [],
        }),
        getCity: build.query({
            query: (id) => `/cities/${id}`,
            transformResponse: (res) => res.data,
        }),
    }),
});

export const { useSearchCitiesQuery, useGetCityQuery } = citiesApi;
