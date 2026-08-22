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
        uploadPhoto: build.mutation({
            query: (formData) => ({ url: '/users/me/photo', method: 'POST', body: formData }),
            transformResponse: (res) => res.data,
            invalidatesTags: ['Me'],
        }),
        updateProfile: build.mutation({
            query: (body) => ({ url: '/users/me', method: 'PUT', body }),
            transformResponse: (res) => res.data,
            invalidatesTags: ['Me'],
        }),
        deleteAccount: build.mutation({
            query: () => ({ url: '/users/me', method: 'DELETE' }),
            invalidatesTags: ['Me'],
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
    useUploadPhotoMutation,
    useUpdateProfileMutation,
    useDeleteAccountMutation,
} = authApi;
