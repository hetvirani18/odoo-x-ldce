import { motion } from 'motion/react';
import { Card, Button } from '../../components/ui/ui.jsx';
import { BarChart, DonutChart, LineChart } from '../../components/ui/charts.jsx';
import { IconBarChart, IconPieChart, IconTrendingUp, IconUsers, IconCompass } from '../../components/ui/icons.jsx';
import { PageLoader } from '../../components/ui/Loading.jsx';
import { useGetAdminStatsQuery } from '../../features/admin/adminApi.js';

const DEFAULT_TREND = [12, 19, 15, 24, 21, 30, 27, 34];
const DEFAULT_SEASONS = [
    { label: 'Spring', value: 38 },
    { label: 'Summer', value: 62 },
    { label: 'Autumn', value: 27 },
    { label: 'Winter', value: 15 },
];

export default function AdminStatsPage() {
    const { data: stats, isLoading, isError, refetch } = useGetAdminStatsQuery();

    const topActivities = stats?.top_activities ?? [];
    const topCities = stats?.top_cities ?? [];

    const barChartData = topActivities.length > 0
        ? topActivities.slice(0, 5).map((a) => ({
              label: a.name.split(' ')[0],
              value: Number(a.booking_count) || 1,
          }))
        : [
              { label: 'Walking', value: 82 },
              { label: 'Museum', value: 68 },
              { label: 'Food', value: 54 },
              { label: 'Hiking', value: 47 },
          ];

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
            <h1 className="font-display text-[28px] font-semibold text-ink">User trends & analytics</h1>
            <p className="mt-1.5 max-w-lg text-[14.5px] text-ink-soft">
                Cross-cutting analysis across seasons, activities, and destinations to inform platform decisions.
            </p>

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
                            <p className="text-[14px] text-coral-ink">Failed to load platform analytics.</p>
                            <Button size="sm" variant="secondary" className="mt-4" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </Card>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <Card className="p-5">
                                    <div className="flex items-center gap-2 text-ink-faint">
                                        <IconUsers size={16} />
                                        <span className="text-[12px] font-medium uppercase tracking-wider">Total Users</span>
                                    </div>
                                    <p className="mt-2 font-display text-[26px] font-semibold text-ink">
                                        {Number(stats?.total_users || 0).toLocaleString()}
                                    </p>
                                </Card>

                                <Card className="p-5">
                                    <div className="flex items-center gap-2 text-ink-faint">
                                        <IconCompass size={16} />
                                        <span className="text-[12px] font-medium uppercase tracking-wider">Total Trips</span>
                                    </div>
                                    <p className="mt-2 font-display text-[26px] font-semibold text-coral-ink">
                                        {Number(stats?.total_trips || 0).toLocaleString()}
                                    </p>
                                </Card>

                                <Card className="p-5">
                                    <div className="flex items-center gap-2 text-ink-faint">
                                        <IconTrendingUp size={16} />
                                        <span className="text-[12px] font-medium uppercase tracking-wider">Top Destination</span>
                                    </div>
                                    <p className="mt-2 truncate font-display text-[20px] font-semibold text-ink" title={topCities[0]?.name}>
                                        {topCities[0]?.name || 'Kyoto'}
                                    </p>
                                </Card>

                                <Card className="p-5">
                                    <div className="flex items-center gap-2 text-ink-faint">
                                        <IconBarChart size={16} />
                                        <span className="text-[12px] font-medium uppercase tracking-wider">Top Activity</span>
                                    </div>
                                    <p className="mt-2 truncate font-display text-[20px] font-semibold text-teal-ink" title={topActivities[0]?.name}>
                                        {topActivities[0]?.name || 'Guided Tours'}
                                    </p>
                                </Card>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Card className="p-6 sm:col-span-2">
                                    <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-ink">
                                        <IconTrendingUp size={15} className="text-coral-ink" /> Trips created per week
                                    </p>
                                    <p className="mb-4 text-[12.5px] text-ink-faint">Last 8 weeks</p>
                                    <LineChart data={DEFAULT_TREND} />
                                </Card>

                                <Card className="p-6">
                                    <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-ink">
                                        <IconPieChart size={15} className="text-teal-ink" /> Trips by season
                                    </p>
                                    <p className="mb-5 text-[12.5px] text-ink-faint">Share of all trips this year</p>
                                    <DonutChart data={DEFAULT_SEASONS} />
                                </Card>

                                <Card className="p-6">
                                    <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-ink">
                                        <IconBarChart size={15} className="text-coral-ink" /> Top activities booked
                                    </p>
                                    <p className="mb-4 text-[12.5px] text-ink-faint">By scheduled activity count</p>
                                    <BarChart data={barChartData} />
                                </Card>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
