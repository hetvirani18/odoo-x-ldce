import { api } from '../../app/api';

export const adminApi = api.injectEndpoints({
    endpoints: (build) => ({
        getAdminStats: build.query({
            query: () => '/admin/stats',
            transformResponse: (res) => res.data,
            providesTags: ['AdminStats'],
        }),
        getAdminUsers: build.query({
            query: (params = {}) => ({
                url: '/admin/users',
                params,
            }),
            transformResponse: (res) => res.data,
            providesTags: ['AdminUser'],
        }),
        updateUserRole: build.mutation({
            query: ({ id, role }) => ({
                url: `/admin/users/${id}/role`,
                method: 'PATCH',
                body: { role },
            }),
            invalidatesTags: ['AdminUser', 'AdminStats'],
        }),
    }),
});

export const {
    useGetAdminStatsQuery,
    useGetAdminUsersQuery,
    useUpdateUserRoleMutation,
} = adminApi;
