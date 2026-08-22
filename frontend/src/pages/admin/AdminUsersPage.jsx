import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, Badge, Button, SearchToolbar } from '../../components/ui/ui.jsx';
import { PageLoader } from '../../components/ui/Loading.jsx';
import { useGetAdminUsersQuery, useUpdateUserRoleMutation } from '../../features/admin/adminApi.js';
import { useGetMeQuery } from '../../features/auth/authApi.js';

export default function AdminUsersPage() {
    const [search, setSearch] = useState('');
    const { data, isLoading, isError, refetch } = useGetAdminUsersQuery({ limit: 100 });
    const { data: me } = useGetMeQuery();
    const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

    const users = data?.users ?? [];

    const filteredUsers = users.filter((u) => {
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
            (u.name && u.name.toLowerCase().includes(query)) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.role && u.role.toLowerCase().includes(query))
        );
    });

    const handleRoleToggle = async (user) => {
        const nextRole = user.role === 'admin' ? 'user' : 'admin';
        try {
            await updateUserRole({ id: user.id, role: nextRole }).unwrap();
        } catch (err) {
            alert(err?.data?.error?.message ?? 'Failed to update user role');
        }
    };

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
            <h1 className="font-display text-[28px] font-semibold text-ink">Manage users</h1>
            <p className="mt-1.5 max-w-lg text-[14.5px] text-ink-soft">
                Manage users and platform access privileges. View user profiles and update administrative roles.
            </p>

            <div className="mt-6">
                <SearchToolbar
                    placeholder="Search users by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="mt-7">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isLoading ? (
                        <div className="py-12">
                            <PageLoader />
                        </div>
                    ) : isError ? (
                        <Card className="p-8 text-center">
                            <p className="text-[14px] text-coral-ink">Failed to load users list.</p>
                            <Button size="sm" variant="secondary" className="mt-4" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </Card>
                    ) : (
                        <Card className="overflow-hidden p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[13.5px]">
                                    <thead>
                                        <tr className="border-b border-border-soft bg-surface-2 text-[12px] uppercase tracking-wide text-ink-faint">
                                            <th className="px-5 py-3.5 font-semibold">User</th>
                                            <th className="px-5 py-3.5 font-semibold">Email</th>
                                            <th className="px-5 py-3.5 font-semibold">Role</th>
                                            <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-5 py-8 text-center text-ink-faint">
                                                    {search ? 'No users matching your search.' : 'No users found.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((u) => {
                                                const isSelf = me?.id === u.id;
                                                return (
                                                    <tr
                                                        key={u.id || u.email}
                                                        className="border-b border-border-soft transition-colors hover:bg-surface/50 last:border-0"
                                                    >
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-[12px] font-bold text-ink">
                                                                    {(u.name?.[0] || 'U').toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-ink">{u.name}</span>
                                                                    {isSelf && (
                                                                        <span className="ml-2 text-[11px] text-ink-faint">(You)</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-ink-soft">{u.email}</td>
                                                        <td className="px-5 py-3.5">
                                                            <Badge tone={u.role === 'admin' ? 'coral' : 'teal'}>
                                                                {u.role === 'admin' ? 'Admin' : 'Traveler'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                disabled={isUpdating || isSelf}
                                                                onClick={() => handleRoleToggle(u)}
                                                                title={isSelf ? 'Cannot modify own role' : undefined}
                                                            >
                                                                {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
