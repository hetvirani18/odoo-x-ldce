import { api } from '../../app/api';

export const tripsApi = api.injectEndpoints({
    endpoints: (build) => ({
        listTrips: build.query({
            query: () => '/trips',
            transformResponse: (res) => res.data,
            providesTags: ['Trip'],
        }),
    }),
});

export const { useListTripsQuery } = tripsApi;
