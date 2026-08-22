import { api } from '../../app/api';

export const publicShareApi = api.injectEndpoints({
    endpoints: (build) => ({
        listPublicTrips: build.query({
            query: () => '/public/trips',
            transformResponse: (res) => res.data || [],
        }),
        getPublicTrip: build.query({
            query: (shareToken) => `/public/trips/${shareToken}`,
            transformResponse: (res) => res.data,
        }),
    }),
});

export const { useListPublicTripsQuery, useGetPublicTripQuery } = publicShareApi;
