import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, Badge, Button, SearchToolbar } from '../../components/ui/ui.jsx';
import { PageLoader } from '../../components/ui/Loading.jsx';
import { useGetAdminStatsQuery } from '../../features/admin/adminApi.js';

export default function AdminCitiesPage() {
    const [search, setSearch] = useState('');
    const { data: stats, isLoading, isError, refetch } = useGetAdminStatsQuery();

    const topCities = stats?.top_cities ?? [];

    const filteredCities = topCities.filter((c) => {
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
            (c.name && c.name.toLowerCase().includes(query)) ||
            (c.country && c.country.toLowerCase().includes(query))
        );
    });

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
            <h1 className="font-display text-[28px] font-semibold text-ink">Popular cities</h1>
            <p className="mt-1.5 max-w-lg text-[14.5px] text-ink-soft">
                Lists the most-visited destinations based on current traveler itineraries and stop counts.
            </p>

            <div className="mt-6">
                <SearchToolbar
                    placeholder="Search cities or countries…"
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
                            <p className="text-[14px] text-coral-ink">Failed to load popular cities.</p>
                            <Button size="sm" variant="secondary" className="mt-4" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </Card>
                    ) : filteredCities.length === 0 ? (
                        <Card className="p-8 text-center text-ink-faint">
                            {search ? 'No cities match your search.' : 'No destination data available yet.'}
                        </Card>
                    ) : (
                        <Card className="flex flex-col divide-y divide-border-soft p-2">
                            {filteredCities.map((c, i) => (
                                <div key={c.id || c.name} className="flex items-center justify-between gap-3 px-4 py-3.5">
                                    <div className="flex items-center gap-3.5">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-[12px] font-semibold text-ink-soft">
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="text-[14px] font-medium text-ink">{c.name}</p>
                                            {c.country && (
                                                <p className="text-[12px] text-ink-faint">{c.country}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[12.5px]">
                                        <span className="text-ink-faint">
                                            {Number(c.stop_count || 0).toLocaleString()} stops planned
                                        </span>
                                        <Badge tone="teal">Top Destination</Badge>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
