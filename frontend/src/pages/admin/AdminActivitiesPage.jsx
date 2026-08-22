import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, Badge, Button, SearchToolbar } from '../../components/ui/ui.jsx';
import { PageLoader } from '../../components/ui/Loading.jsx';
import { useGetAdminStatsQuery } from '../../features/admin/adminApi.js';

export default function AdminActivitiesPage() {
    const [search, setSearch] = useState('');
    const { data: stats, isLoading, isError, refetch } = useGetAdminStatsQuery();

    const topActivities = stats?.top_activities ?? [];

    const totalBookings = topActivities.reduce((acc, a) => acc + Number(a.booking_count || 0), 0) || 1;

    const filteredActivities = topActivities.filter((a) => {
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
            (a.name && a.name.toLowerCase().includes(query)) ||
            (a.category && a.category.toLowerCase().includes(query))
        );
    });

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
            <h1 className="font-display text-[28px] font-semibold text-ink">Popular activities</h1>
            <p className="mt-1.5 max-w-lg text-[14.5px] text-ink-soft">
                Lists the most-scheduled and booked experiences across all active itineraries.
            </p>

            <div className="mt-6">
                <SearchToolbar
                    placeholder="Search activities by name or category…"
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
                            <p className="text-[14px] text-coral-ink">Failed to load popular activities.</p>
                            <Button size="sm" variant="secondary" className="mt-4" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </Card>
                    ) : filteredActivities.length === 0 ? (
                        <Card className="p-8 text-center text-ink-faint">
                            {search ? 'No activities match your search.' : 'No activity booking data available yet.'}
                        </Card>
                    ) : (
                        <Card className="flex flex-col gap-5 p-6">
                            {filteredActivities.map((a) => {
                                const bookingCount = Number(a.booking_count || 0);
                                const pct = Math.round((bookingCount / totalBookings) * 100) || 10;
                                return (
                                    <div key={a.id || a.name}>
                                        <div className="mb-2 flex items-center justify-between text-[13.5px]">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-ink">{a.name}</span>
                                                {a.category && (
                                                    <Badge tone="neutral" className="text-[11px]">
                                                        {a.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-ink-faint">
                                                <span>{bookingCount} bookings</span>
                                                <span className="font-medium text-coral-ink">({pct}%)</span>
                                            </div>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${pct}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                                className="h-full rounded-full bg-coral"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </Card>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
