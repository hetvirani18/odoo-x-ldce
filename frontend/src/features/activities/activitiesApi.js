import { api } from '../../app/api';

export const activitiesApi = api.injectEndpoints({
    endpoints: (build) => ({
        listActivitiesForCity: build.query({
            query: ({ cityId, category, maxCost }) => ({
                url: `/cities/${cityId}/activities`,
                params: {
                    ...(category ? { category } : {}),
                    ...(maxCost !== undefined && maxCost !== '' ? { maxCost } : {}),
                },
            }),
            transformResponse: (res) => res.data || [],
        }),
        getActivity: build.query({
            query: (id) => `/activities/${id}`,
            transformResponse: (res) => res.data,
        }),
    }),
});

export const { useListActivitiesForCityQuery, useGetActivityQuery } = activitiesApi;
