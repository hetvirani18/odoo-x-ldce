import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { SearchToolbar, SectionHeading, Button } from '../components/ui/ui.jsx';
import { RegionCard, TripCard } from '../components/ui/cards.jsx';
import { IconArrowRight, IconPlus } from '../components/ui/icons.jsx';
import { useGetMeQuery } from '../features/auth/authApi.js';
import { useSearchCitiesQuery } from '../features/cities/citiesApi.js';
import { useListTripsQuery } from '../features/trips/tripsApi.js';

const DEFAULT_REGIONS = [
    { name: 'Paris', country: 'France', tone: 'coral' },
    { name: 'Rome', country: 'Italy', tone: 'teal' },
    { name: 'Tokyo', country: 'Japan', tone: 'gold' },
    { name: 'Bangkok', country: 'Thailand', tone: 'coral' },
    { name: 'Barcelona', country: 'Spain', tone: 'teal' },
    { name: 'Goa', country: 'India', tone: 'gold' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: user } = useGetMeQuery();
    const { data: cities = [] } = useSearchCitiesQuery('');
    const { data: trips = [] } = useListTripsQuery();

    const userName = user?.name ? user.name.split(' ')[0] : 'Traveler';

    const handleSearchSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/search');
        }
    };

    const displayRegions = cities.length > 0
        ? cities.slice(0, 6).map((c, i) => ({
            id: c.id,
            name: c.name,
            country: c.country,
            imageUrl: c.image_url,
            tone: ['coral', 'teal', 'gold'][i % 3],
        }))
        : DEFAULT_REGIONS;

    return (
        <div className="mx-auto max-w-6xl px-6 py-10 pb-20">
            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-[28px] px-8 py-14 text-white sm:px-14 sm:py-20"
                style={{
                    background:
                        'radial-gradient(120% 140% at 10% 10%, oklch(68% 0.16 40) 0%, transparent 55%), radial-gradient(110% 130% at 95% 100%, oklch(45% 0.09 205) 0%, transparent 55%), var(--color-canvas)',
                }}
            >
                <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 800 400" fill="none">
                    <path d="M0 320 Q200 200 400 260 T800 180" stroke="white" strokeWidth="1.5" strokeDasharray="2 12" />
                </svg>
                <div className="relative max-w-xl">
                    <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Your next escape
                    </p>
                    <h1 className="font-display text-[38px] font-semibold leading-[1.1] sm:text-[48px]">
                        Where to next, {userName}?
                    </h1>
                    <p className="mt-4 max-w-md text-[15px] text-white/75">
                        Build a day-by-day itinerary, track your budget as you explore, and discover handpicked activities worldwide.
                    </p>
                    <Button size="lg" className="mt-7" icon={<IconPlus size={16} />} onClick={() => navigate('/trips/new')}>
                        Plan a trip
                    </Button>
                </div>
            </motion.div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-10">
                <SearchToolbar
                    placeholder="Search destinations, cities, activities…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                />
            </form>

            {/* Regional Selections Section */}
            <section className="mt-12">
                <SectionHeading
                    eyebrow="Handpicked"
                    title="Top regional selections"
                    action={
                        <button
                            className="flex cursor-pointer items-center gap-1 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
                            onClick={() => navigate('/search')}
                        >
                            See all <IconArrowRight size={14} />
                        </button>
                    }
                />
                <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
                    {displayRegions.map((r, i) => (
                        <div
                            key={r.name}
                            onClick={() => navigate(`/search?q=${encodeURIComponent(r.name)}`)}
                            className="cursor-pointer"
                        >
                            <RegionCard {...r} index={i} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Previous Trips Section */}
            <section className="mt-14">
                <SectionHeading
                    eyebrow="Your Journeys"
                    title="My Trips"
                    action={
                        <Button size="sm" variant="outline" icon={<IconPlus size={14} />} onClick={() => navigate('/trips/new')}>
                            Plan a trip
                        </Button>
                    }
                />
                {trips.length === 0 ? (
                    <div className="mt-5 rounded-3xl border border-dashed border-border-soft bg-surface/50 p-10 text-center">
                        <p className="text-[15px] font-medium text-ink">No trips planned yet</p>
                        <p className="mt-1 text-[13px] text-ink-faint">Start planning your first dream getaway today.</p>
                        <Button size="sm" variant="primary" icon={<IconPlus size={14} />} onClick={() => navigate('/trips/new')} className="mt-5">
                            Create First Trip
                        </Button>
                    </div>
                ) : (
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {trips.slice(0, 6).map((t, i) => (
                            <TripCard
                                key={t.id}
                                id={t.id}
                                name={t.name}
                                dates={`${t.start_date} – ${t.end_date}`}
                                photoUrl={t.cover_photo_url}
                                tone={['coral', 'teal', 'gold'][i % 3]}
                                index={i}
                                onView={() => navigate(`/trips/${t.id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
