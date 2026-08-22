import { api } from '../../app/api';

export const activitiesApi = api.injectEndpoints({
    endpoints: (build) => ({
        getCityActivities: build.query({
            query: (cityId) => `/cities/${cityId}/activities`,
            transformResponse: (res) => res.data,
        }),
    }),
});

export const { useGetCityActivitiesQuery } = activitiesApi;
