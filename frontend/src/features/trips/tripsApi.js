import { api } from '../../app/api';

export const tripsApi = api.injectEndpoints({
    endpoints: (build) => ({
        listTrips: build.query({
            query: () => '/trips',
            transformResponse: (res) => res.data || [],
            providesTags: (result = []) => [
                ...result.map((t) => ({ type: 'Trip', id: t.id })),
                { type: 'Trip', id: 'LIST' },
            ],
        }),
        getTrip: build.query({
            query: (id) => `/trips/${id}`,
            transformResponse: (res) => res.data,
            providesTags: (result, error, id) => [{ type: 'Trip', id }],
        }),
        createTrip: build.mutation({
            query: (body) => ({ url: '/trips', method: 'POST', body }),
            transformResponse: (res) => res.data,
            invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
        }),
    }),
});

export const { useListTripsQuery, useGetTripQuery, useCreateTripMutation } = tripsApi;
