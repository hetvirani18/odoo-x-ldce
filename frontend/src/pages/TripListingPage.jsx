import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button, SearchToolbar, SectionHeading } from '../components/ui/ui.jsx';
import { TripCard } from '../components/ui/cards.jsx';
import { IconPlus } from '../components/ui/icons.jsx';
import Loading from '../components/ui/Loading.jsx';
import { useListTripsQuery } from '../features/trips/tripsApi.js';

const TONES = ['coral', 'teal', 'gold'];

function formatDateDisplay(startDate, endDate) {
    if (!startDate) return '';
    try {
        const s = new Date(startDate);
        const e = endDate ? new Date(endDate) : s;
        const sMonth = s.toLocaleString('default', { month: 'short' });
        const eMonth = e.toLocaleString('default', { month: 'short' });
        const year = s.getFullYear();

        if (sMonth === eMonth) {
            return `${sMonth} ${s.getDate()} – ${e.getDate()}, ${year}`;
        }
        return `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}, ${year}`;
    } catch {
        return `${startDate} – ${endDate}`;
    }
}

function TripGroup({ title, trips, onNavigate }) {
    if (!trips.length) return null;
    return (
        <section className="mt-11 first:mt-0">
            <SectionHeading title={title} />
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((t, i) => (
                    <TripCard
                        key={t.id}
                        id={t.id}
                        name={t.name}
                        dates={t.displayDates}
                        status={t.status}
                        cities={t.cities}
                        photoUrl={t.cover_photo_url}
                        tone={t.tone}
                        index={i}
                        onView={() => onNavigate(`/trips/${t.id}`)}
                    />
                ))}
            </div>
        </section>
    );
}

export default function TripListingPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { data: rawTrips = [], isLoading, error } = useListTripsQuery();

    const todayStr = useMemo(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const processedTrips = useMemo(() => {
        return rawTrips.map((t, index) => {
            let status = 'Upcoming';
            if (t.start_date <= todayStr && t.end_date >= todayStr) {
                status = 'Ongoing';
            } else if (t.end_date < todayStr) {
                status = 'Completed';
            }

            const cities = t.stops?.map((s) => s.city?.name).filter(Boolean) || [];

            return {
                ...t,
                status,
                displayDates: formatDateDisplay(t.start_date, t.end_date),
                cities,
                tone: TONES[index % TONES.length],
            };
        });
    }, [rawTrips, todayStr]);

    const filteredTrips = useMemo(() => {
        if (!search.trim()) return processedTrips;
        const q = search.toLowerCase();
        return processedTrips.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                t.cities.some((c) => c.toLowerCase().includes(q))
        );
    }, [processedTrips, search]);

    const ongoingTrips = useMemo(
        () => filteredTrips.filter((t) => t.status === 'Ongoing'),
        [filteredTrips]
    );
    const upcomingTrips = useMemo(
        () => filteredTrips.filter((t) => t.status === 'Upcoming'),
        [filteredTrips]
    );
    const completedTrips = useMemo(
        () => filteredTrips.filter((t) => t.status === 'Completed'),
        [filteredTrips]
    );

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-[28px] font-semibold text-ink">Your trips</h1>
                    <p className="mt-1.5 text-[14.5px] text-ink-soft">
                        Everything you've planned, in progress, or already lived.
                    </p>
                </div>
                <Button
                    variant="coral"
                    icon={<IconPlus size={16} />}
                    onClick={() => navigate('/trips/new')}
                >
                    Plan a trip
                </Button>
            </div>

            <div className="mt-7">
                <SearchToolbar
                    placeholder="Search your trips…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {error && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-[14px] text-red-600 dark:text-red-400">
                    Failed to load trips. Please check your connection.
                </div>
            )}

            {filteredTrips.length === 0 && !error && (
                <div className="mt-12 rounded-[28px] border border-dashed border-border-soft bg-surface/50 p-12 text-center">
                    <p className="font-display text-[18px] font-medium text-ink">
                        {search ? 'No trips match your search' : 'No trips yet'}
                    </p>
                    <p className="mt-1.5 text-[14px] text-ink-soft">
                        {search
                            ? 'Try searching for another destination or trip name.'
                            : 'Start exploring the world and create your first customized itinerary.'}
                    </p>
                    {!search && (
                        <Button
                            className="mt-6 inline-flex"
                            icon={<IconPlus size={16} />}
                            onClick={() => navigate('/trips/new')}
                        >
                            Plan a new trip
                        </Button>
                    )}
                </div>
            )}

            <div className="mt-8">
                <TripGroup title="Ongoing" trips={ongoingTrips} onNavigate={navigate} />
                <TripGroup title="Upcoming" trips={upcomingTrips} onNavigate={navigate} />
                <TripGroup title="Completed" trips={completedTrips} onNavigate={navigate} />
            </div>
        </main>
    );
}
