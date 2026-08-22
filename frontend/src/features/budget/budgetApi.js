import { api } from '../../app/api';

export const budgetApi = api.injectEndpoints({
    endpoints: (build) => ({
        getTripBudget: build.query({
            query: (tripId) => `/trips/${tripId}/budget`,
            transformResponse: (res) => res.data,
            providesTags: (result, error, tripId) => [{ type: 'Budget', id: tripId }],
        }),
        getTripExpenses: build.query({
            query: (tripId) => `/trips/${tripId}/expenses`,
            transformResponse: (res) => res.data,
            providesTags: (result, error, tripId) => [{ type: 'Budget', id: tripId }],
        }),
    }),
});

export const { useGetTripBudgetQuery, useGetTripExpensesQuery } = budgetApi;
