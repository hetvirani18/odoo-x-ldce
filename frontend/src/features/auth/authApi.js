import { api } from '../../app/api';

export const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        signup: build.mutation({
            query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
            transformResponse: (res) => res.data,
            invalidatesTags: ['Me'],
        }),
        login: build.mutation({
            query: (body) => ({ url: '/auth/login', method: 'POST', body }),
            transformResponse: (res) => res.data,
            invalidatesTags: ['Me'],
        }),
        logout: build.mutation({
            query: () => ({ url: '/auth/logout', method: 'POST' }),
            invalidatesTags: ['Me'],
        }),
        forgotPassword: build.mutation({
            query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
        }),
        resetPassword: build.mutation({
            query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
        }),
        getMe: build.query({
            query: () => '/users/me',
            transformResponse: (res) => res.data,
            providesTags: ['Me'],
        }),
    }),
});

export const {
    useSignupMutation,
    useLoginMutation,
    useLogoutMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGetMeQuery,
} = authApi;
