import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Field, Input } from '../components/ui/ui.jsx';
import {
    IconArrowRight,
    IconCalendar,
    IconPlus,
    IconPin,
    IconTrash,
    IconWallet,
} from '../components/ui/icons.jsx';
import Loading from '../components/ui/Loading.jsx';
import { useGetTripQuery } from '../features/trips/tripsApi.js';
import {
    useAddStopMutation,
    useDeleteStopMutation,
    useAddActivityToStopMutation,
    useRemoveActivityFromStopMutation,
} from '../features/itinerary/itineraryApi.js';
import { useSearchCitiesQuery } from '../features/cities/citiesApi.js';
import { useGetCityActivitiesQuery } from '../features/activities/activitiesApi.js';

function StopActivitySection({ stop, tripId }) {
    const [isAddingActivity, setIsAddingActivity] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [activityDate, setActivityDate] = useState(stop.start_date);
    const [activityTime, setActivityTime] = useState('10:00');
    const [errorMsg, setErrorMsg] = useState(null);

    const { data: cityActivities = [], isLoading: isActivitiesLoading } = useGetCityActivitiesQuery(
        stop.city_id,
        { skip: !stop.city_id }
    );

    const [addActivity, { isLoading: isSubmittingActivity }] = useAddActivityToStopMutation();
    const [removeActivity] = useRemoveActivityFromStopMutation();

    const handleSaveActivity = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!selectedActivityId) {
            setErrorMsg('Please select an activity.');
            return;
        }

        try {
            await addActivity({
                stopId: stop.id,
                tripId: Number(tripId),
                activity_id: Number(selectedActivityId),
                scheduled_date: activityDate || stop.start_date,
                scheduled_time: activityTime || null,
            }).unwrap();

            setIsAddingActivity(false);
            setSelectedActivityId('');
        } catch (err) {
            console.error('Failed to add activity:', err);
            setErrorMsg(err?.data?.error?.message || 'Failed to add activity.');
        }
    };

    const handleRemoveActivity = async (activityId) => {
        try {
            await removeActivity({
                stopId: stop.id,
                activityId,
                tripId: Number(tripId),
            }).unwrap();
        } catch (err) {
            console.error('Failed to remove activity:', err);
        }
    };

    const scheduledActivities = stop.activities || [];

    return (
        <div className="mt-4 border-t border-border-soft pt-4">
            <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-ink-soft uppercase tracking-wider">
                    Scheduled Activities ({scheduledActivities.length})
                </p>
                {!isAddingActivity && (
                    <button
                        type="button"
                        onClick={() => {
                            setActivityDate(stop.start_date);
                            setIsAddingActivity(true);
                        }}
                        className="flex cursor-pointer items-center gap-1 text-[12.5px] font-semibold text-coral-ink transition-colors hover:text-coral"
                    >
                        <IconPlus size={14} /> Add activity
                    </button>
                )}
            </div>

            {scheduledActivities.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                    {scheduledActivities.map((act) => (
                        <div
                            key={act.id || act.activity_id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface-2 px-3.5 py-2 text-[13px]"
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-ink">
                                    {act.activity?.name || act.name || 'Activity'}
                                </span>
                                {act.scheduled_time && (
                                    <span className="text-[11.5px] text-ink-faint">
                                        @ {act.scheduled_time}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 font-semibold text-teal-ink">
                                    <IconWallet size={12} /> $
                                    {Number(act.activity?.cost || act.cost || 0).toLocaleString()}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveActivity(act.activity_id || act.id)}
                                    title="Remove activity"
                                    className="cursor-pointer text-ink-faint hover:text-red-500"
                                >
                                    <IconTrash size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAddingActivity && (
                <form
                    onSubmit={handleSaveActivity}
                    className="mt-3 rounded-2xl border border-coral/20 bg-surface-2 p-4"
                >
                    <p className="text-[13px] font-semibold text-ink">
                        Schedule an activity in {stop.city?.name}
                    </p>

                    {errorMsg && (
                        <p className="mt-1 text-[12px] text-red-500">{errorMsg}</p>
                    )}

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-3">
                            <label className="mb-1 block text-[12px] font-medium text-ink-soft">
                                Select Activity
                            </label>
                            {isActivitiesLoading ? (
                                <p className="text-[12px] text-ink-faint">Loading activities...</p>
                            ) : (
                                <select
                                    value={selectedActivityId}
                                    onChange={(e) => setSelectedActivityId(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-coral"
                                >
                                    <option value="">-- Choose an activity --</option>
                                    {cityActivities.map((ca) => (
                                        <option key={ca.id} value={ca.id}>
                                            {ca.name} (${Number(ca.cost || 0)}) - {ca.category}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-[12px] font-medium text-ink-soft">
                                Date
                            </label>
                            <input
                                type="date"
                                min={stop.start_date}
                                max={stop.end_date}
                                value={activityDate}
                                onChange={(e) => setActivityDate(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-[12.5px] text-ink outline-none focus:border-coral"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-[12px] font-medium text-ink-soft">
                                Time
                            </label>
                            <input
                                type="time"
                                value={activityTime}
                                onChange={(e) => setActivityTime(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-[12.5px] text-ink outline-none focus:border-coral"
                            />
                        </div>

                        <div className="flex items-end justify-end gap-2 sm:col-span-1">
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsAddingActivity(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmittingActivity}
                            >
                                {isSubmittingActivity ? 'Saving...' : 'Add'}
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function BuildItineraryPage() {
    const { tripId } = useParams();
    const navigate = useNavigate();

    const { data: trip, isLoading: tripLoading, error: tripError } = useGetTripQuery(tripId);
    const [addStop, { isLoading: isAddingStop }] = useAddStopMutation();
    const [deleteStop] = useDeleteStopMutation();

    const [isAdding, setIsAdding] = useState(false);
    const [citySearch, setCitySearch] = useState('Paris');
    const [selectedCity, setSelectedCity] = useState(null);
    const [stopStart, setStopStart] = useState('');
    const [stopEnd, setStopEnd] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);

    const { data: cityResults = [] } = useSearchCitiesQuery(citySearch, {
        skip: !citySearch || citySearch.length < 2,
    });

    const handleOpenAdd = () => {
        setErrorMessage(null);
        if (trip?.start_date && trip?.end_date) {
            setStopStart(trip.start_date);
            setStopEnd(trip.end_date);
        }
        setIsAdding(true);
    };

    const handleCreateStop = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        const cityId = selectedCity?.id || (cityResults.length > 0 ? cityResults[0].id : null);
        if (!cityId) {
            setErrorMessage('Please select a valid destination city.');
            return;
        }

        try {
            await addStop({
                tripId: Number(tripId),
                city_id: cityId,
                start_date: stopStart || trip.start_date,
                end_date: stopEnd || trip.end_date,
            }).unwrap();

            setIsAdding(false);
            setSelectedCity(null);
            setCitySearch('');
        } catch (err) {
            console.error('Failed to add stop:', err);
            setErrorMessage(err?.data?.error?.message || 'Failed to add stop. Please check date ranges.');
        }
    };

    const handleDeleteStop = async (stopId) => {
        try {
            await deleteStop({ id: stopId, tripId: Number(tripId) }).unwrap();
        } catch (err) {
            console.error('Failed to delete stop:', err);
        }
    };

    if (tripLoading) {
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

    const stops = trip.stops || [];

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">
                        {trip.name}
                    </p>
                    <h1 className="font-display text-[28px] font-semibold text-ink">
                        Build your itinerary
                    </h1>
                </div>
                <Button
                    variant="dark"
                    icon={<IconArrowRight size={16} />}
                    onClick={() => navigate(`/trips/${tripId}`)}
                >
                    View itinerary
                </Button>
            </div>

            {errorMessage && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-[14px] text-red-600 dark:text-red-400">
                    {errorMessage}
                </div>
            )}

            <div className="mt-8 flex flex-col gap-4">
                <AnimatePresence initial={false}>
                    {stops.map((s, i) => (
                        <motion.div
                            key={s.id || i}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="rounded-[26px] border border-border-soft bg-surface p-6"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-display text-[17px] font-semibold text-ink">
                                        {s.city?.name || `Stop ${i + 1}`}
                                        {s.city?.country ? `, ${s.city.country}` : ''}
                                    </p>
                                    <p className="mt-1 text-[13.5px] text-ink-soft">
                                        Stay in {s.city?.name || 'destination'} — exploration & activities
                                    </p>
                                    <p className="mt-0.5 text-[12.5px] text-ink-faint">
                                        {s.city?.cost_index ? `Cost index: ${s.city.cost_index} · ` : ''}
                                        Order: {s.order_index + 1}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 font-display text-[13px] font-semibold text-ink-soft">
                                        {i + 1}
                                    </span>
                                    <button
                                        type="button"
                                        title="Delete stop"
                                        onClick={() => handleDeleteStop(s.id)}
                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                                    >
                                        <IconTrash size={15} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                <Field label="Date range">
                                    <Input
                                        icon={<IconCalendar size={16} />}
                                        readOnly
                                        value={`${s.start_date} → ${s.end_date}`}
                                    />
                                </Field>
                                <Field label="Destination city">
                                    <Input
                                        icon={<IconPin size={16} />}
                                        readOnly
                                        value={s.city ? `${s.city.name}, ${s.city.country}` : 'Selected city'}
                                    />
                                </Field>
                            </div>

                            {/* Scheduled activities sub-section */}
                            <StopActivitySection stop={s} tripId={tripId} />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {stops.length === 0 && !isAdding && (
                    <div className="rounded-[26px] border border-dashed border-border-soft bg-surface/50 p-8 text-center">
                        <p className="font-display text-[16px] font-medium text-ink">
                            No stops added yet
                        </p>
                        <p className="mt-1 text-[13.5px] text-ink-soft">
                            Add destination cities to your trip between {trip.start_date} and {trip.end_date}.
                        </p>
                    </div>
                )}
            </div>

            {/* Add Section / Stop Form */}
            {isAdding ? (
                <motion.form
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleCreateStop}
                    className="mt-5 rounded-[26px] border border-coral/30 bg-surface p-6 shadow-sm"
                >
                    <h3 className="font-display text-[16px] font-semibold text-ink">
                        Add New Stop
                    </h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Search Destination City" className="sm:col-span-2">
                            <Input
                                icon={<IconPin size={16} />}
                                placeholder="Type city name (e.g. Paris, Rome, Tokyo)..."
                                value={citySearch}
                                onChange={(e) => {
                                    setCitySearch(e.target.value);
                                    setSelectedCity(null);
                                }}
                            />
                            {cityResults.length > 0 && !selectedCity && (
                                <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-surface shadow-md">
                                    {cityResults.map((c) => (
                                        <button
                                            type="button"
                                            key={c.id}
                                            onClick={() => {
                                                setSelectedCity(c);
                                                setCitySearch(`${c.name}, ${c.country}`);
                                            }}
                                            className="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-left text-[13.5px] hover:bg-surface-2"
                                        >
                                            <span className="font-medium text-ink">{c.name}, {c.country}</span>
                                            <span className="text-[12px] text-ink-faint">{c.cost_index} cost</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </Field>

                        <Field label="Stop Start Date">
                            <Input
                                icon={<IconCalendar size={16} />}
                                type="date"
                                min={trip.start_date}
                                max={trip.end_date}
                                value={stopStart}
                                onChange={(e) => setStopStart(e.target.value)}
                            />
                        </Field>

                        <Field label="Stop End Date">
                            <Input
                                icon={<IconCalendar size={16} />}
                                type="date"
                                min={stopStart || trip.start_date}
                                max={trip.end_date}
                                value={stopEnd}
                                onChange={(e) => setStopEnd(e.target.value)}
                            />
                        </Field>
                    </div>

                    <div className="mt-5 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAdding(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isAddingStop}
                            icon={<IconPlus size={16} />}
                        >
                            {isAddingStop ? 'Adding...' : 'Save Stop'}
                        </Button>
                    </div>
                </motion.form>
            ) : (
                <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenAdd}
                    className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[26px] border border-dashed border-border py-5 text-[14px] font-medium text-ink-soft transition-colors hover:border-coral hover:text-coral-ink"
                >
                    <IconPlus size={16} /> Add another section
                </motion.button>
            )}
        </main>
    );
}
