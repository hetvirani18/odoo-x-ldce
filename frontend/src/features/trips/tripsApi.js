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
            providesTags: (result, error, id) => [
                { type: 'Trip', id },
                { type: 'Stop', id: `TRIP_${id}` },
                { type: 'Budget', id },
            ],
        }),
        createTrip: build.mutation({
            query: (body) => ({ url: '/trips', method: 'POST', body }),
            transformResponse: (res) => res.data,
            invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
        }),
        updateTrip: build.mutation({
            query: ({ id, ...body }) => ({ url: `/trips/${id}`, method: 'PUT', body }),
            transformResponse: (res) => res.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'Trip', id },
                { type: 'Trip', id: 'LIST' },
                { type: 'Budget', id },
            ],
        }),
        deleteTrip: build.mutation({
            query: (id) => ({ url: `/trips/${id}`, method: 'DELETE' }),
            invalidatesTags: (result, error, id) => [
                { type: 'Trip', id },
                { type: 'Trip', id: 'LIST' },
            ],
        }),
        shareTrip: build.mutation({
            query: (id) => ({ url: `/trips/${id}/share`, method: 'POST' }),
            transformResponse: (res) => res.data,
            invalidatesTags: (result, error, id) => [
                { type: 'Trip', id },
                { type: 'Trip', id: 'LIST' },
            ],
        }),
        unshareTrip: build.mutation({
            query: (id) => ({ url: `/trips/${id}/share`, method: 'DELETE' }),
            transformResponse: (res) => res.data,
            invalidatesTags: (result, error, id) => [
                { type: 'Trip', id },
                { type: 'Trip', id: 'LIST' },
            ],
        }),
        uploadTripPhoto: build.mutation({
            query: ({ id, formData }) => ({ url: `/trips/${id}/photo`, method: 'POST', body: formData }),
            transformResponse: (res) => res.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'Trip', id },
                { type: 'Trip', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useListTripsQuery,
    useGetTripQuery,
    useCreateTripMutation,
    useUpdateTripMutation,
    useDeleteTripMutation,
    useShareTripMutation,
    useUnshareTripMutation,
    useUploadTripPhotoMutation,
} = tripsApi;
