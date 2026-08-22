import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { SearchToolbar, Avatar, Button, Input } from '../components/ui/ui.jsx';
import { IconArrowRight, IconCalendar, IconPin, IconShare } from '../components/ui/icons.jsx';
import { useListPublicTripsQuery } from '../features/publicShare/publicShareApi.js';
import { getInitials, resolveAssetUrl } from '../lib/utils.js';

export default function CommunityPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [shareTokenInput, setShareTokenInput] = useState('');

    const { data: livePublicTrips = [] } = useListPublicTripsQuery();

    const formattedLiveTrips = livePublicTrips.map((t, idx) => ({
        id: String(t.id),
        owner: t.owner_name || 'Traveler',
        ownerPhoto: t.owner_photo,
        trip: t.name,
        dates: `${t.start_date} – ${t.end_date}`,
        cities: [],
        tone: ['coral', 'teal', 'gold'][idx % 3],
        shareToken: t.share_token,
        description: t.description || 'Public traveler itinerary on GlobeTrotter.',
    }));

    const filteredTrips = formattedLiveTrips.filter((t) => {
        const q = searchQuery.toLowerCase();
        return (
            t.trip.toLowerCase().includes(q) ||
            t.owner.toLowerCase().includes(q) ||
            t.cities.some((c) => c.toLowerCase().includes(q))
        );
    });

    const handleLookupToken = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const raw = shareTokenInput.trim();
        if (!raw) return;

        // Extract token if full URL was pasted
        const token = raw.includes('/t/') ? raw.split('/t/')[1] : raw.includes('/shared/') ? raw.split('/shared/')[1] : raw;
        navigate(`/t/${token}`);
    };

    return (
        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-10 pb-20 lg:grid-cols-[1fr_320px]">
            <div>
                <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">
                    Traveler Community
                </p>
                <h1 className="font-display text-[30px] font-semibold text-ink">Shared Itineraries</h1>
                <p className="mt-1.5 max-w-lg text-[14.5px] text-ink-soft">
                    Browse public itineraries curated by travelers worldwide, or enter a share link to view an itinerary.
                </p>

                {/* Direct Share Link Lookup Bar */}
                <form onSubmit={handleLookupToken} className="mt-6 rounded-3xl border border-border-soft bg-surface-2/60 p-4">
                    <p className="mb-2 text-[12.5px] font-semibold uppercase tracking-wider text-ink-faint">
                        Have a private or shared trip link?
                    </p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Paste share token or URL (e.g. 48-char token)…"
                            value={shareTokenInput}
                            onChange={(e) => setShareTokenInput(e.target.value)}
                            icon={<IconShare size={16} />}
                            className="bg-surface"
                        />
                        <Button type="submit" variant="dark" className="shrink-0">
                            Open Trip
                        </Button>
                    </div>
                </form>

                {/* Search Bar */}
                <div className="mt-6">
                    <SearchToolbar
                        placeholder="Search shared trips, destinations, or travelers…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Itineraries List */}
                <div className="mt-7 flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredTrips.map((t, i) => (
                            <motion.article
                                key={t.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: i * 0.05, duration: 0.35 }}
                                whileHover={{ y: -2 }}
                                className="flex flex-wrap items-center gap-5 rounded-3xl border border-border-soft bg-surface p-5 transition-shadow hover:shadow-[0_14px_30px_-18px_rgba(30,15,5,0.3)] sm:flex-nowrap"
                            >
                                <Avatar
                                    initials={getInitials(t.owner)}
                                    photoUrl={resolveAssetUrl(t.ownerPhoto)}
                                    tone={t.tone}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                        <p className="text-[15.5px] font-semibold text-ink">{t.trip}</p>
                                    </div>
                                    <p className="mt-1 text-[13px] text-ink-soft line-clamp-1">{t.description}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-faint">
                                        <span>shared by {t.owner}</span>
                                        <span className="flex items-center gap-1.5">
                                            <IconCalendar size={12} /> {t.dates}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <IconPin size={12} /> {t.cities.join(' · ')}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    icon={<IconArrowRight size={13} />}
                                    onClick={() => navigate(`/t/${t.shareToken}`)}
                                    className="shrink-0"
                                >
                                    View itinerary
                                </Button>
                            </motion.article>
                        ))}
                    </AnimatePresence>

                    {filteredTrips.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-border-soft bg-surface p-12 text-center">
                            <p className="text-[15px] font-medium text-ink">
                                {searchQuery ? 'No matching public trips' : 'No public trips shared yet'}
                            </p>
                            <p className="mt-1 text-[13px] text-ink-faint">
                                {searchQuery
                                    ? 'Try searching for a different destination or keyword.'
                                    : 'Be the first to make a trip public and it will show up here.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar info */}
            <aside className="h-fit rounded-3xl border border-border-soft bg-surface-2 p-6 lg:sticky lg:top-24">
                <p className="font-display text-[16px] font-semibold text-ink">About Public Itineraries</p>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    When you turn on public sharing for any trip in your dashboard, GlobeTrotter creates a read-only shareable link.
                </p>
                <div className="mt-5 border-t border-border-soft pt-4">
                    <p className="font-display text-[14px] font-semibold text-ink">Want to share yours?</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                        Go to your trip detail page, toggle <strong>Share Publicly</strong>, and copy the generated link.
                    </p>
                    <Button
                        size="sm"
                        variant="soft"
                        onClick={() => navigate('/trips')}
                        className="mt-4 w-full"
                    >
                        View My Trips
                    </Button>
                </div>
            </aside>
        </main>
    );
}
