import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Button, SearchToolbar } from '../components/ui/ui.jsx';
import { SharePanel } from '../components/ui/SharePanel.jsx';
import { IconCalendar, IconEdit, IconPin, IconWallet, IconPlus } from '../components/ui/icons.jsx';
import Loading from '../components/ui/Loading.jsx';
import { useGetTripQuery } from '../features/trips/tripsApi.js';
import { useGetTripExpensesQuery } from '../features/budget/budgetApi.js';

function DayBlock({ label, items, index, onAddActivities }) {
    const total = items.reduce((sum, it) => sum + (Number(it.cost) || 0), 0);

    return (
        <div className="relative">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-ink px-4 py-1.5 font-display text-[13px] font-semibold text-bg">
                        {label}
                    </span>
                    <span className="text-[12.5px] text-ink-faint">
                        ${total.toLocaleString()} planned
                    </span>
                </div>
                {onAddActivities && (
                    <button
                        type="button"
                        onClick={onAddActivities}
                        className="flex cursor-pointer items-center gap-1 text-[12.5px] font-medium text-coral-ink hover:text-coral"
                    >
                        <IconPlus size={14} /> Add activity
                    </button>
                )}
            </div>

            <div className="relative flex flex-col">
                {items.map((it, i) => (
                    <motion.div
                        key={it.id || it.name + i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (index * 3 + i) * 0.05, duration: 0.35 }}
                        className="relative flex items-stretch gap-4 pb-4 last:pb-0"
                    >
                        {i < items.length - 1 && (
                            <span className="absolute left-[13px] top-9 h-[calc(100%-14px)] w-px bg-border" />
                        )}
                        <span className="relative z-10 mt-1 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 border-coral bg-surface" />

                        <div className="flex flex-1 items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface px-5 py-4">
                            <div>
                                <p className="text-[14px] font-medium text-ink">{it.name}</p>
                                {it.time && (
                                    <p className="mt-0.5 text-[12px] text-ink-faint">
                                        Time: {it.time}
                                    </p>
                                )}
                            </div>
                            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-[12.5px] font-semibold text-teal-ink">
                                <IconWallet size={12} /> ${Number(it.cost || 0).toLocaleString()}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function TripDetailPage() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const { data: trip, isLoading: isTripLoading, error: tripError } = useGetTripQuery(tripId);
    const { data: expenseData } = useGetTripExpensesQuery(tripId, { skip: !tripId });

    // Calculate nights between start_date and end_date
    const nightsCount = useMemo(() => {
        if (!trip?.start_date || !trip?.end_date) return 0;
        const diff = new Date(trip.end_date) - new Date(trip.start_date);
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [trip?.start_date, trip?.end_date]);

    // Build timeline blocks by Stop / Day
    const dayBlocks = useMemo(() => {
        if (!trip?.stops || trip.stops.length === 0) {
            return [];
        }

        return trip.stops.map((stop, sIdx) => {
            const cityName = stop.city?.name || `Stop ${sIdx + 1}`;
            const activities = stop.activities || [];

            // Find matching itemized expense from backend budget calculation
            const stopExpense = expenseData?.stops?.find((s) => s.stop_id === stop.id);

            const items = [];

            // 1. Add scheduled activities
            if (activities.length > 0) {
                activities.forEach((act) => {
                    items.push({
                        id: act.id,
                        name: act.activity?.name || act.name || 'Scheduled Activity',
                        time: act.scheduled_time || null,
                        cost: Number(act.activity?.cost || act.cost || 0),
                    });
                });
            }

            // 2. Add accommodation / stay & meal estimate for this stop if available
            if (stopExpense?.costs) {
                const stayAndMeal = (stopExpense.costs.accommodation_cost || 0) + (stopExpense.costs.meal_cost || 0);
                if (stayAndMeal > 0) {
                    items.push({
                        id: `stay-${stop.id}`,
                        name: `Accommodation & Meals in ${cityName} (${stopExpense.nights} nights)`,
                        time: 'Daily estimate',
                        cost: stayAndMeal,
                    });
                }
            } else if (items.length === 0) {
                items.push({
                    id: `stop-${stop.id}`,
                    name: `Explore ${cityName} (${stop.start_date} → ${stop.end_date})`,
                    time: null,
                    cost: 0,
                });
            }

            return {
                label: `Stop ${sIdx + 1}: ${cityName}`,
                items,
            };
        });
    }, [trip?.stops, expenseData]);

    const filteredBlocks = useMemo(() => {
        if (!search.trim()) return dayBlocks;
        const q = search.toLowerCase();
        return dayBlocks
            .map((block) => ({
                ...block,
                items: block.items.filter((it) => it.name.toLowerCase().includes(q)),
            }))
            .filter((block) => block.items.length > 0);
    }, [dayBlocks, search]);

    const summary = expenseData?.summary;
    const totalBudget = useMemo(() => {
        if (summary?.total_cost != null && Number(summary.total_cost) > 0) {
            return Number(summary.total_cost);
        }
        return dayBlocks
            .flatMap((d) => d.items)
            .reduce((sum, it) => sum + (Number(it.cost) || 0), 0);
    }, [summary, dayBlocks]);

    if (isTripLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (tripError || !trip) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-10">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-600 dark:text-red-400">
                    <p className="font-semibold">Trip not found or access denied.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/trips')}>
                        Back to Trips
                    </Button>
                </div>
            </main>
        );
    }

    const stopsCount = trip.stops?.length || 0;
    const activitiesCount = trip.stops?.reduce(
        (sum, s) => sum + (s.activities?.length || 0),
        0
    ) || 0;

    return (
        <main className="mx-auto max-w-3xl px-6 py-10 pb-20">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">
                        {trip.name}
                    </p>
                    <h1 className="font-display text-[28px] font-semibold text-ink">
                        Itinerary for {trip.name}
                    </h1>
                    <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-faint">
                        <IconCalendar size={14} /> {trip.start_date} → {trip.end_date}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="soft"
                        icon={<IconEdit size={14} />}
                        onClick={() => navigate(`/trips/${tripId}/build`)}
                    >
                        Edit Stops
                    </Button>
                    <SharePanel trip={trip} />
                </div>
            </div>

            <div className="mt-6">
                <SearchToolbar
                    placeholder="Search activities in this trip…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Summary & Cost Breakdown */}
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border-soft bg-surface-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[13.5px] text-ink-soft">
                        {nightsCount} {nightsCount === 1 ? 'night' : 'nights'} · {stopsCount}{' '}
                        {stopsCount === 1 ? 'city' : 'cities'} · {activitiesCount} planned activities
                    </p>
                    <p className="flex items-center gap-1.5 font-display text-[18px] font-semibold text-ink">
                        <IconWallet size={18} className="text-coral-ink" /> ${totalBudget.toLocaleString()}{' '}
                        total
                    </p>
                </div>

                {summary && (
                    <div className="flex flex-wrap items-center gap-3 border-t border-border-soft/60 pt-3 text-[12.5px] text-ink-soft">
                        {summary.accommodation_cost > 0 && (
                            <span>🏨 Stay: <strong>${Number(summary.accommodation_cost).toLocaleString()}</strong></span>
                        )}
                        {summary.meal_cost > 0 && (
                            <span>🍽️ Meals: <strong>${Number(summary.meal_cost).toLocaleString()}</strong></span>
                        )}
                        {summary.transport_cost > 0 && (
                            <span>✈️ Transport: <strong>${Number(summary.transport_cost).toLocaleString()}</strong></span>
                        )}
                        {summary.activity_cost > 0 && (
                            <span>🎯 Activities: <strong>${Number(summary.activity_cost).toLocaleString()}</strong></span>
                        )}
                    </div>
                )}
            </div>

            {/* Timeline Blocks */}
            <div className="mt-10 flex flex-col gap-10">
                {filteredBlocks.map((d, i) => (
                    <DayBlock
                        key={d.label}
                        label={d.label}
                        items={d.items}
                        index={i}
                        onAddActivities={() => navigate(`/trips/${tripId}/build`)}
                    />
                ))}

                {filteredBlocks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border-soft bg-surface/50 p-8 text-center">
                        <p className="font-medium text-ink">
                            {search ? 'No activities matched your search' : 'No stops or activities added yet'}
                        </p>
                        <p className="mt-1 text-[13.5px] text-ink-soft">
                            Add destinations and schedule activities to build your trip.
                        </p>
                        <Button
                            className="mt-4"
                            variant="outline"
                            icon={<IconPin size={15} />}
                            onClick={() => navigate(`/trips/${tripId}/build`)}
                        >
                            Add Stops & Activities
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
