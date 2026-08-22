import { Link, useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { Avatar, Button } from '../components/ui/ui.jsx';
import { PageLoader } from '../components/ui/Loading.jsx';
import { IconCalendar, IconCompass, IconWallet } from '../components/ui/icons.jsx';
import { useGetPublicTripQuery } from '../features/publicShare/publicShareApi.js';
import { getInitials, resolveAssetUrl } from '../lib/utils.js';

function StopBlock({ stop, index }) {
    const items = stop.activities.map((act) => ({
        id: act.id,
        name: act.name,
        time: act.scheduled_time,
        cost: Number(act.cost) || 0,
    }));
    const total = items.reduce((sum, it) => sum + it.cost, 0);
    const label = `Stop ${index + 1}: ${stop.city?.name || ''}${stop.city?.country ? `, ${stop.city.country}` : ''}`;

    return (
        <div className="relative">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-ink px-4 py-1.5 font-display text-[13px] font-semibold text-bg">
                        {label}
                    </span>
                    <span className="text-[12.5px] text-ink-faint">${total.toLocaleString()} planned</span>
                </div>
                <span className="text-[12px] text-ink-faint">
                    {stop.start_date} → {stop.end_date}
                </span>
            </div>

            {items.length === 0 ? (
                <p className="pl-1 text-[13px] text-ink-faint">No activities scheduled for this stop.</p>
            ) : (
                <div className="relative flex flex-col">
                    {items.map((it, i) => (
                        <motion.div
                            key={it.id}
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
                                    {it.time && <p className="mt-0.5 text-[12px] text-ink-faint">Time: {it.time}</p>}
                                </div>
                                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-[12.5px] font-semibold text-teal-ink">
                                    <IconWallet size={12} /> ${it.cost.toLocaleString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PublicTripPage() {
    const { shareToken } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetPublicTripQuery(shareToken, { skip: !shareToken });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-bg">
                <PageLoader />
            </div>
        );
    }

    if (isError || !data?.trip) {
        return (
            <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
                <p className="font-display text-[22px] font-semibold text-ink">This trip isn't available</p>
                <p className="mt-2 text-[14px] text-ink-soft">
                    The link may be wrong, or the owner has stopped sharing this itinerary.
                </p>
                <Link to="/community" className="mt-6 text-[13.5px] font-medium text-coral-ink underline underline-offset-2">
                    Browse public trips
                </Link>
            </main>
        );
    }

    const { trip, owner, stops, cost_estimate: summary } = data;
    const stopsCount = stops.length;
    const activitiesCount = stops.reduce((sum, s) => sum + s.activities.length, 0);
    const totalBudget = summary ? Number(summary.total_cost) : 0;

    return (
        <main className="mx-auto max-w-3xl px-6 py-10 pb-20">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">
                        <IconCompass size={13} /> Public itinerary
                    </p>
                    <h1 className="font-display text-[28px] font-semibold text-ink">
                        Itinerary for {trip.name}
                    </h1>
                    <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-faint">
                        <IconCalendar size={14} /> {trip.start_date} → {trip.end_date}
                    </p>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl border border-border-soft bg-surface px-3.5 py-2.5">
                    <Avatar initials={getInitials(owner?.name)} size={34} photoUrl={resolveAssetUrl(owner?.photo_url)} />
                    <div>
                        <p className="text-[11.5px] text-ink-faint">Shared by</p>
                        <p className="text-[13.5px] font-semibold text-ink">{owner?.name || 'A GlobeTrotter traveler'}</p>
                    </div>
                </div>
            </div>

            {trip.description && (
                <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{trip.description}</p>
            )}

            {/* Summary & Cost Breakdown */}
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border-soft bg-surface-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[13.5px] text-ink-soft">
                        {stopsCount} {stopsCount === 1 ? 'city' : 'cities'} · {activitiesCount} planned activities
                    </p>
                    <p className="flex items-center gap-1.5 font-display text-[18px] font-semibold text-ink">
                        <IconWallet size={18} className="text-coral-ink" /> ${totalBudget.toLocaleString()} total
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
                {stops.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border-soft bg-surface/50 p-8 text-center">
                        <p className="font-medium text-ink">No stops added to this trip yet.</p>
                    </div>
                ) : (
                    stops.map((stop, i) => <StopBlock key={stop.id} stop={stop} index={i} />)
                )}
            </div>

            <div className="mt-12 border-t border-border-soft pt-6 text-center">
                <p className="text-[13px] text-ink-faint">Want to plan your own trip?</p>
                <Button size="sm" variant="soft" className="mt-3" onClick={() => navigate('/')}>
                    Explore GlobeTrotter
                </Button>
            </div>
        </main>
    );
}
