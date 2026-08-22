import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { SearchToolbar, IconButton, Button } from '../components/ui/ui.jsx';
import { IconChevronLeft, IconChevronRight, IconPlus, IconArrowRight } from '../components/ui/icons.jsx';
import { useListTripsQuery } from '../features/trips/tripsApi.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const toneDot = { coral: 'bg-coral', teal: 'bg-teal', gold: 'bg-gold' };
const toneBg = {
    coral: 'bg-coral-soft text-coral-ink hover:bg-coral-soft/80',
    teal: 'bg-teal-soft text-teal-ink hover:bg-teal-soft/80',
    gold: 'bg-gold-soft text-gold-ink hover:bg-gold-soft/80',
};

function buildMonth(year, month) {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
}

export default function CalendarPage() {
    const navigate = useNavigate();
    const [cursor, setCursor] = useState(new Date());
    const [searchFilter, setSearchFilter] = useState('');
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const cells = useMemo(() => buildMonth(year, month), [year, month]);
    const today = new Date();

    const { data: userTrips = [] } = useListTripsQuery();

    const shift = (delta) => setCursor(new Date(year, month + delta, 1));

    // Map user trips to days of the currently viewed month
    const eventsByDay = useMemo(() => {
        const map = {};
        const tones = ['coral', 'teal', 'gold'];

        userTrips.forEach((trip, idx) => {
            if (!trip.start_date) return;
            if (searchFilter && !trip.name.toLowerCase().includes(searchFilter.toLowerCase())) return;

            const startParts = String(trip.start_date).split('T')[0].split(' ')[0].split('-').map(Number);
            const endParts = trip.end_date
                ? String(trip.end_date).split('T')[0].split(' ')[0].split('-').map(Number)
                : startParts;

            const startInt = startParts[0] * 10000 + startParts[1] * 100 + startParts[2];
            const endInt = endParts[0] * 10000 + endParts[1] * 100 + endParts[2];
            const tone = tones[idx % tones.length];

            const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
            for (let day = 1; day <= daysInCurrentMonth; day++) {
                const currentInt = year * 10000 + (month + 1) * 100 + day;
                if (currentInt >= startInt && currentInt <= endInt) {
                    if (!map[day]) map[day] = [];
                    map[day].push({
                        id: trip.id,
                        label: trip.name,
                        tone,
                        start_date: trip.start_date,
                        end_date: trip.end_date,
                    });
                }
            }
        });
        return map;
    }, [userTrips, year, month, searchFilter]);

    return (
        <main className="mx-auto max-w-5xl px-6 py-10 pb-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-[30px] font-semibold text-ink">Calendar view</h1>
                    <p className="mt-1 text-[14.5px] text-ink-soft">See every trip and stop laid across the month.</p>
                </div>
                <Button size="sm" variant="primary" icon={<IconPlus size={15} />} onClick={() => navigate('/trips/new')}>
                    Plan a trip
                </Button>
            </div>

            {/* Search Filter */}
            <div className="mt-6">
                <SearchToolbar
                    placeholder="Filter trips on calendar…"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                />
            </div>

            {/* Calendar Box */}
            <div className="mt-8 overflow-hidden rounded-[28px] border border-border-soft bg-surface shadow-sm">
                {/* Header Controls */}
                <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
                    <IconButton onClick={() => shift(-1)}>
                        <IconChevronLeft size={17} />
                    </IconButton>
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={`${year}-${month}`}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.2 }}
                            className="font-display text-[20px] font-semibold text-ink"
                        >
                            {MONTHS[month]} {year}
                        </motion.h2>
                    </AnimatePresence>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCursor(new Date())}
                            className="text-[12px] h-8 px-3"
                        >
                            Today
                        </Button>
                        <IconButton onClick={() => shift(1)}>
                            <IconChevronRight size={17} />
                        </IconButton>
                    </div>
                </div>

                {/* Weekday Strip */}
                <div className="grid grid-cols-7 border-b border-border-soft px-3 py-3 sm:px-5">
                    {WEEKDAYS.map((w) => (
                        <div key={w} className="text-center text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
                            {w}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${year}-${month}-grid`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-7 gap-1.5 p-3 sm:p-5"
                    >
                        {cells.map((d, i) => {
                            const dayEvents = d ? eventsByDay[d] || [] : [];
                            const isToday =
                                d &&
                                year === today.getFullYear() &&
                                month === today.getMonth() &&
                                d === today.getDate();

                            return (
                                <div
                                    key={i}
                                    onClick={() => d && dayEvents.length > 0 && setSelectedDayEvents({ day: d, events: dayEvents })}
                                    className={`flex min-h-[90px] flex-col gap-1.5 rounded-2xl p-2 text-left transition-colors sm:min-h-[105px] sm:p-2.5 ${
                                        d ? 'bg-surface-2/50 hover:bg-surface-2' : 'opacity-0'
                                    } ${dayEvents.length > 0 ? 'cursor-pointer ring-1 ring-border-soft' : ''}`}
                                >
                                    {d && (
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold ${
                                                    isToday ? 'bg-coral text-white' : 'text-ink-soft'
                                                }`}
                                            >
                                                {d}
                                            </span>
                                            {dayEvents.length > 0 && (
                                                <span className="text-[10px] font-semibold text-ink-faint">
                                                    {dayEvents.length} {dayEvents.length === 1 ? 'trip' : 'trips'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {dayEvents.map((ev, evIdx) => (
                                        <button
                                            key={`${ev.id}-${evIdx}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/trips/${ev.id}`);
                                            }}
                                            className={`truncate rounded-lg px-2 py-1 text-[11px] font-semibold leading-tight transition-transform hover:scale-[1.02] cursor-pointer text-left ${
                                                toneBg[ev.tone]
                                            }`}
                                        >
                                            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${toneDot[ev.tone]}`} />
                                            {ev.label}
                                        </button>
                                    ))}
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Selected Day Quick View Modal */}
            {selectedDayEvents && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedDayEvents(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md rounded-3xl border border-border-soft bg-surface p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-display text-[18px] font-semibold text-ink">
                            Trips on {MONTHS[month]} {selectedDayEvents.day}, {year}
                        </h3>
                        <div className="mt-4 flex flex-col gap-3">
                            {selectedDayEvents.events.map((ev) => (
                                <div
                                    key={ev.id}
                                    className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface-2 p-4"
                                >
                                    <div>
                                        <p className="text-[15px] font-semibold text-ink">{ev.label}</p>
                                        <p className="mt-0.5 text-[12.5px] text-ink-faint">
                                            {ev.start_date} → {ev.end_date}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        icon={<IconArrowRight size={13} />}
                                        onClick={() => navigate(`/trips/${ev.id}`)}
                                    >
                                        View
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedDayEvents(null)}
                            className="mt-5 w-full"
                        >
                            Close
                        </Button>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
