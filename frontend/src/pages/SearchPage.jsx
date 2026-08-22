import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router';
import { SearchToolbar, Badge, Button } from '../components/ui/ui.jsx';
import { IconArrowRight, IconHeart, IconPin } from '../components/ui/icons.jsx';
import { useSearchCitiesQuery } from '../features/cities/citiesApi.js';
import { useListActivitiesForCityQuery } from '../features/activities/activitiesApi.js';

const CATEGORIES = [
    { id: '', label: 'All Activities' },
    { id: 'sightseeing', label: 'Sightseeing' },
    { id: 'culture', label: 'Culture & Arts' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'adventure', label: 'Adventure & Outdoors' },
];

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialQuery = searchParams.get('q') || '';

    const [searchInput, setSearchInput] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
    const [selectedCityId, setSelectedCityId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [savedItems, setSavedItems] = useState(new Set());

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchInput);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // Query matching cities
    const { data: cities = [] } = useSearchCitiesQuery(debouncedQuery);

    const activeCity = cities.find((c) => c.id === selectedCityId) || cities[0];

    // Query activities for active city
    const {
        data: activities = [],
        isLoading: isActivitiesLoading,
    } = useListActivitiesForCityQuery(
        {
            cityId: activeCity?.id || 1,
            category: selectedCategory,
        },
        { skip: !activeCity?.id }
    );

    const toggleSave = (activityId, e) => {
        e.stopPropagation();
        setSavedItems((prev) => {
            const next = new Set(prev);
            if (next.has(activityId)) next.delete(activityId);
            else next.add(activityId);
            return next;
        });
    };

    return (
        <main className="mx-auto max-w-5xl px-6 py-10 pb-20">
            <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">
                Explore Destinations & Things to Do
            </p>
            <h1 className="font-display text-[30px] font-semibold text-ink">Find something extraordinary</h1>

            {/* Search Input Toolbar */}
            <div className="mt-6">
                <SearchToolbar
                    placeholder="Search cities (e.g., Paris, Rome, Tokyo, Goa)…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>

            {/* Cities Horizontal Selection Strip */}
            {cities.length > 0 && (
                <div className="mt-6">
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-ink-faint">
                        Destinations matching search
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {cities.map((city) => {
                            const isSelected = city.id === selectedCityId;
                            return (
                                <button
                                    key={city.id || `${city.name}-${city.country}`}
                                    onClick={() => setSelectedCityId(city.id)}
                                    className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2.5 text-[13.5px] font-medium transition-all ${
                                        isSelected
                                            ? 'border-ink bg-ink text-bg shadow-md'
                                            : 'border-border-soft bg-surface text-ink hover:border-ink'
                                    }`}
                                >
                                    <IconPin size={14} className={isSelected ? 'text-coral' : 'text-ink-faint'} />
                                    <span>{city.name}</span>
                                    <span className={`text-[12px] ${isSelected ? 'text-white/60' : 'text-ink-faint'}`}>
                                        {city.country}
                                    </span>
                                    <Badge tone={city.cost_index === 'high' ? 'coral' : city.cost_index === 'medium' ? 'gold' : 'teal'}>
                                        {city.cost_index} cost
                                    </Badge>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Category Filter Pills */}
            <div className="mt-8 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`cursor-pointer rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                                isSelected
                                    ? 'bg-coral text-white shadow-sm'
                                    : 'border border-border-soft bg-surface text-ink-soft hover:border-ink hover:text-ink'
                            }`}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Results Header */}
            <div className="mt-8 flex items-center justify-between">
                <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                    {activities.length} results near {activeCity ? `${activeCity.name}, ${activeCity.country}` : 'Destination'}
                </p>
                {activeCity && (
                    <Button size="sm" variant="soft" onClick={() => navigate('/trips/new')}>
                        Plan trip to {activeCity.name}
                    </Button>
                )}
            </div>

            {/* Activities List */}
            {isActivitiesLoading ? (
                <div className="mt-8 flex flex-col gap-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-24 animate-pulse rounded-2xl border border-border-soft bg-surface/50" />
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed border-border-soft bg-surface p-12 text-center">
                    <p className="text-[15px] font-medium text-ink">No activities found</p>
                    <p className="mt-1 text-[13px] text-ink-faint">Try adjusting your filters or search for another city.</p>
                </div>
            ) : (
                <div className="mt-4 flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {activities.map((act, i) => {
                            const isSaved = savedItems.has(act.id || act.name);
                            return (
                                <motion.div
                                    key={act.id || act.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: i * 0.04, duration: 0.3 }}
                                    whileHover={{ x: 3 }}
                                    onClick={() => navigate('/trips/new')}
                                    className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border-soft bg-surface p-5 text-left transition-colors hover:border-ink"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-soft text-teal-ink">
                                            <IconPin size={19} />
                                        </span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[15px] font-semibold text-ink">{act.name}</p>
                                                <Badge tone={act.category === 'adventure' ? 'coral' : act.category === 'culture' ? 'gold' : 'teal'}>
                                                    {act.category}
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 text-[13px] text-ink-soft">
                                                {act.description || `Popular attraction in ${activeCity?.name}`}
                                            </p>
                                            <div className="mt-1.5 flex items-center gap-3 text-[12px] text-ink-faint">
                                                {act.duration_hours && (
                                                    <span>{act.duration_hours} hrs</span>
                                                )}
                                                <span>•</span>
                                                <span className="font-semibold text-ink">
                                                    {Number(act.cost) === 0 ? 'Free entry' : `from $${Number(act.cost).toFixed(2)}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => toggleSave(act.id || act.name, e)}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
                                                isSaved ? 'text-coral-ink bg-coral-soft' : 'text-ink-faint hover:text-coral-ink bg-surface-2'
                                            }`}
                                        >
                                            <IconHeart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                                        </button>
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink-soft transition-colors group-hover:bg-ink group-hover:text-bg">
                                            <IconArrowRight size={15} />
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </main>
    );
}
