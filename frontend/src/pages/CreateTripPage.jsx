import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { Button, Field, Input, SectionHeading } from '../components/ui/ui.jsx';
import { PlaceCard } from '../components/ui/cards.jsx';
import { IconArrowRight, IconCalendar, IconPin } from '../components/ui/icons.jsx';
import { useCreateTripMutation } from '../features/trips/tripsApi.js';
import { createTripSchema } from '../features/trips/schemas.js';
import { useSearchCitiesQuery } from '../features/cities/citiesApi.js';

const placeTones = ['coral', 'teal', 'gold', 'coral', 'teal', 'gold'];

// Format local date YYYY-MM-DD
function getFormattedDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function CreateTripPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState(null);
    const [createTrip, { isLoading }] = useCreateTripMutation();
    const { data: popularCities = [], isLoading: isCitiesLoading } = useSearchCitiesQuery('');
    const placeSuggestions = popularCities.slice(0, 6);

    const today = new Date();
    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() + 7);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultStart.getDate() + 7);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(createTripSchema),
        defaultValues: {
            name: '',
            start_date: getFormattedDate(defaultStart),
            end_date: getFormattedDate(defaultEnd),
            description: '',
            is_public: false,
        },
    });

    const onSubmit = async (values) => {
        setServerError(null);
        try {
            const result = await createTrip(values).unwrap();
            if (result?.id) {
                navigate(`/trips/${result.id}/build`);
            } else {
                navigate('/trips');
            }
        } catch (err) {
            console.error('Failed to create trip:', err);
            const msg = err?.data?.error?.message || 'Failed to create trip. Please try again.';
            setServerError(msg);
        }
    };

    const handleSelectSuggestion = (city) => {
        setValue('name', `${city.name}, ${city.country}`, { shouldValidate: true });
    };

    return (
        <main className="mx-auto max-w-5xl px-6 py-10">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
            >
                <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">
                    New trip
                </p>
                <h1 className="font-display text-[30px] font-semibold text-ink">Plan a new trip</h1>
                <p className="mt-2 max-w-lg text-[14.5px] text-ink-soft">
                    Set the shape of your trip first — dates and destination — then pick from ideas
                    we've lined up below.
                </p>
            </motion.div>

            {serverError && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-[14px] text-red-600 dark:text-red-400">
                    {serverError}
                </div>
            )}

            <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 grid grid-cols-1 gap-4 rounded-[28px] border border-border-soft bg-surface p-6 sm:grid-cols-2 sm:p-8"
            >
                <Field
                    label="Trip Name / Destination"
                    error={errors.name?.message}
                    className="sm:col-span-2"
                >
                    <Input
                        icon={<IconPin size={17} />}
                        placeholder="e.g. Paris in Bloom, France"
                        {...register('name')}
                    />
                </Field>

                <Field label="Start date" error={errors.start_date?.message}>
                    <Input
                        icon={<IconCalendar size={17} />}
                        type="date"
                        {...register('start_date')}
                    />
                </Field>

                <Field label="End date" error={errors.end_date?.message}>
                    <Input
                        icon={<IconCalendar size={17} />}
                        type="date"
                        {...register('end_date')}
                    />
                </Field>

                <div className="mt-2 flex items-center justify-end gap-3 sm:col-span-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/trips')}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        icon={<IconArrowRight size={16} />}
                    >
                        {isLoading ? 'Creating trip...' : 'Continue to itinerary'}
                    </Button>
                </div>
            </motion.form>

            {(isCitiesLoading || placeSuggestions.length > 0) && (
                <section className="mt-14 pb-16">
                    <SectionHeading
                        eyebrow="Get inspired"
                        title="Popular destinations from other travelers"
                    />
                    {isCitiesLoading ? (
                        <p className="mt-5 text-[13.5px] text-ink-soft">Loading suggestions…</p>
                    ) : (
                        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {placeSuggestions.map((city, i) => (
                                <PlaceCard
                                    key={city.id}
                                    label={`${city.name}, ${city.country}`}
                                    tone={placeTones[i % placeTones.length]}
                                    index={i}
                                    onClick={() => handleSelectSuggestion(city)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}
