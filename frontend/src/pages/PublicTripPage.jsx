import { Link, useParams } from 'react-router';
import { Avatar } from '../components/ui/ui.jsx';
import { PageLoader } from '../components/ui/Loading.jsx';
import { IconCalendar, IconCompass, IconPin, IconWallet } from '../components/ui/icons.jsx';
import { useGetPublicTripQuery } from '../features/publicShare/publicShareApi.js';
import { getInitials, resolveAssetUrl } from '../lib/utils.js';

function StopBlock({ stop, index }) {
    const total = stop.activities.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
    return (
        <div className="rounded-[26px] border border-border-soft bg-surface p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-display text-[17px] font-semibold text-ink">
                        Stop {index + 1}: {stop.city?.name}
                        {stop.city?.country ? `, ${stop.city.country}` : ''}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-faint">
                        {stop.start_date} → {stop.end_date}
                    </p>
                </div>
                {total > 0 && (
                    <span className="flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-[12.5px] font-semibold text-teal-ink">
                        <IconWallet size={12} /> ${total.toLocaleString()}
                    </span>
                )}
            </div>

            {stop.activities.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 border-t border-border-soft pt-4">
                    {stop.activities.map((act) => (
                        <div
                            key={act.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface-2 px-3.5 py-2.5 text-[13px]"
                        >
                            <div>
                                <span className="font-medium text-ink">{act.name}</span>
                                {act.scheduled_time && (
                                    <span className="ml-2 text-[11.5px] text-ink-faint">@ {act.scheduled_time}</span>
                                )}
                            </div>
                            <span className="font-semibold text-ink-soft">
                                {Number(act.cost) > 0 ? `$${Number(act.cost).toLocaleString()}` : 'Free'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PublicTripPage() {
    const { shareToken } = useParams();
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

    const { trip, owner, stops, cost_estimate: costEstimate } = data;
    const coverUrl = resolveAssetUrl(trip.cover_photo_url);
    const stopsCount = stops.length;
    const activitiesCount = stops.reduce((sum, s) => sum + s.activities.length, 0);

    return (
        <main className="min-h-screen bg-bg pb-20">
            <div
                className="relative flex h-[280px] w-full items-end bg-cover bg-center text-white sm:h-[340px]"
                style={
                    coverUrl
                        ? { backgroundImage: `url(${coverUrl})` }
                        : { background: 'radial-gradient(120% 140% at 10% 10%, oklch(68% 0.16 40) 0%, transparent 55%), radial-gradient(110% 130% at 95% 100%, oklch(45% 0.09 205) 0%, transparent 55%), var(--color-canvas)' }
                }
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
                <div className="relative mx-auto w-full max-w-3xl px-6 pb-8">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                        <IconCompass size={12} /> Public itinerary
                    </span>
                    <h1 className="mt-3 font-display text-[32px] font-semibold leading-tight sm:text-[40px]">
                        {trip.name}
                    </h1>
                    <p className="mt-2 flex items-center gap-2 text-[13.5px] text-white/80">
                        <IconCalendar size={14} /> {trip.start_date} → {trip.end_date}
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-6">
                {/* Owner strip */}
                <div className="-mt-8 flex items-center gap-3 rounded-2xl border border-border-soft bg-surface p-4 shadow-sm">
                    <Avatar initials={getInitials(owner?.name)} size={44} photoUrl={resolveAssetUrl(owner?.photo_url)} />
                    <div>
                        <p className="text-[13.5px] text-ink-soft">Shared by</p>
                        <p className="text-[15px] font-semibold text-ink">{owner?.name || 'A GlobeTrotter traveler'}</p>
                    </div>
                </div>

                {trip.description && (
                    <p className="mt-6 text-[14.5px] leading-relaxed text-ink-soft">{trip.description}</p>
                )}

                {/* Summary */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface-2 p-5">
                    <p className="flex items-center gap-4 text-[13.5px] text-ink-soft">
                        <span className="flex items-center gap-1.5">
                            <IconPin size={14} /> {stopsCount} {stopsCount === 1 ? 'city' : 'cities'}
                        </span>
                        <span>{activitiesCount} planned activities</span>
                    </p>
                    {costEstimate && (
                        <p className="flex items-center gap-1.5 font-display text-[18px] font-semibold text-ink">
                            <IconWallet size={18} className="text-coral-ink" />
                            ${Number(costEstimate.total_cost).toLocaleString()} total
                        </p>
                    )}
                </div>

                {/* Stops */}
                <div className="mt-8 flex flex-col gap-6">
                    {stops.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border-soft bg-surface/50 p-8 text-center text-ink-faint">
                            No stops added to this trip yet.
                        </div>
                    ) : (
                        stops.map((stop, i) => <StopBlock key={stop.id} stop={stop} index={i} />)
                    )}
                </div>
            </div>
        </main>
    );
}
