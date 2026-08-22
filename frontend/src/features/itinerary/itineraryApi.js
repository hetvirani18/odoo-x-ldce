import { api } from '../../app/api';

export const itineraryApi = api.injectEndpoints({
    endpoints: (build) => ({
        listStops: build.query({
            query: (tripId) => `/trips/${tripId}/stops`,
            transformResponse: (res) => res.data,
            providesTags: (result = [], error, tripId) => [
                ...result.map((s) => ({ type: 'Stop', id: s.id })),
                { type: 'Stop', id: `TRIP_${tripId}` },
            ],
        }),
        addStop: build.mutation({
            query: ({ tripId, ...body }) => ({
                url: `/trips/${tripId}/stops`,
                method: 'POST',
                body,
            }),
            transformResponse: (res) => res.data,
            invalidatesTags: (result, error, { tripId }) => [
                { type: 'Stop', id: `TRIP_${tripId}` },
                { type: 'Trip', id: tripId },
                { type: 'Budget', id: tripId },
            ],
        }),
        updateStop: build.mutation({
            query: ({ id, tripId, ...body }) => ({
                url: `/stops/${id}`,
                method: 'PUT',
                body,
            }),
            transformResponse: (res) => res.data,
            invalidatesTags: (result, error, { id, tripId }) => [
                { type: 'Stop', id },
                ...(tripId ? [{ type: 'Stop', id: `TRIP_${tripId}` }, { type: 'Trip', id: tripId }, { type: 'Budget', id: tripId }] : []),
            ],
        }),
        deleteStop: build.mutation({
            query: ({ id }) => ({
                url: `/stops/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { id, tripId }) => [
                { type: 'Stop', id },
                ...(tripId ? [{ type: 'Stop', id: `TRIP_${tripId}` }, { type: 'Trip', id: tripId }, { type: 'Budget', id: tripId }] : []),
            ],
        }),
        reorderStops: build.mutation({
            query: ({ tripId, stop_ids }) => ({
                url: `/trips/${tripId}/stops/reorder`,
                method: 'PUT',
                body: { stop_ids },
            }),
            transformResponse: (res) => res.data,
            invalidatesTags: (result, error, { tripId }) => [
                { type: 'Stop', id: `TRIP_${tripId}` },
                { type: 'Trip', id: tripId },
            ],
        }),
        listStopActivities: build.query({
            query: (stopId) => `/stops/${stopId}/activities`,
            transformResponse: (res) => res.data,
            providesTags: (result = [], error, stopId) => [
                { type: 'Stop', id: `ACTIVITIES_${stopId}` },
            ],
        }),
        addActivityToStop: build.mutation({
            query: ({ stopId, tripId, ...body }) => ({
                url: `/stops/${stopId}/activities`,
                method: 'POST',
                body,
            }),
            transformResponse: (res) => res.data,
            invalidatesTags: (result, error, { stopId, tripId }) => [
                { type: 'Stop', id: `ACTIVITIES_${stopId}` },
                { type: 'Stop', id: stopId },
                ...(tripId ? [{ type: 'Trip', id: tripId }, { type: 'Budget', id: tripId }] : []),
            ],
        }),
        removeActivityFromStop: build.mutation({
            query: ({ stopId, activityId }) => ({
                url: `/stops/${stopId}/activities/${activityId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { stopId, tripId }) => [
                { type: 'Stop', id: `ACTIVITIES_${stopId}` },
                { type: 'Stop', id: stopId },
                ...(tripId ? [{ type: 'Trip', id: tripId }, { type: 'Budget', id: tripId }] : []),
            ],
        }),
    }),
});

export const {
    useListStopsQuery,
    useAddStopMutation,
    useUpdateStopMutation,
    useDeleteStopMutation,
    useReorderStopsMutation,
    useListStopActivitiesQuery,
    useAddActivityToStopMutation,
    useRemoveActivityFromStopMutation,
} = itineraryApi;
