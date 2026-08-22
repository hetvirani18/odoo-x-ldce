import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Avatar, Button, Field, Input, SectionHeading } from '../components/ui/ui.jsx';
import { TripCard } from '../components/ui/cards.jsx';
import { PageLoader } from '../components/ui/Loading.jsx';
import { IconCamera, IconEdit, IconGlobe, IconMail, IconPlus, IconTrash } from '../components/ui/icons.jsx';
import {
    useDeleteAccountMutation,
    useGetMeQuery,
    useUpdateProfileMutation,
    useUploadPhotoMutation,
} from '../features/auth/authApi.js';
import { useListTripsQuery } from '../features/trips/tripsApi.js';
import { formatDateRange, getInitials, getTripStatus, resolveAssetUrl } from '../lib/utils.js';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ja', label: 'Japanese' },
];

const TONES = ['coral', 'teal', 'gold'];
const STATUS_LABEL = { upcoming: 'Upcoming', ongoing: 'Ongoing', completed: 'Completed' };

export default function ProfilePage() {
    const navigate = useNavigate();
    const { data: me, isLoading: isMeLoading } = useGetMeQuery();
    const { data: trips, isLoading: isTripsLoading } = useListTripsQuery();
    const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
    const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadPhotoMutation();
    const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

    const fileInputRef = useRef(null);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ name: '', language: 'en' });
    const [saveError, setSaveError] = useState('');
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    if (isMeLoading || !me?.user) {
        return <PageLoader />;
    }

    const user = me.user;

    const startEditing = () => {
        setDraft({ name: user.name, language: user.language || 'en' });
        setSaveError('');
        setEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(draft).unwrap();
            setEditing(false);
        } catch (err) {
            setSaveError(err?.data?.error?.message ?? 'Could not save changes. Please try again.');
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('photo', file);
        try {
            await uploadPhoto(formData).unwrap();
        } catch {
            // Ignored — the avatar simply stays as-is if the upload fails.
        }
        e.target.value = '';
    };

    const handleDelete = async () => {
        try {
            await deleteAccount().unwrap();
        } finally {
            navigate('/login', { replace: true });
        }
    };

    const tripList = trips ?? [];
    const upcoming = tripList.filter((t) => getTripStatus(t.start_date, t.end_date) !== 'completed');
    const past = tripList.filter((t) => getTripStatus(t.start_date, t.end_date) === 'completed');

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
            <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6 rounded-[28px] border border-border-soft bg-surface p-6 sm:flex-row sm:p-8"
            >
                <div className="group/avatar relative h-fit shrink-0 self-center sm:self-start">
                    <Avatar initials={getInitials(user.name)} size={92} photoUrl={resolveAssetUrl(user.photo_url)} />
                    <button
                        type="button"
                        title="Change photo"
                        disabled={isUploadingPhoto}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-[1px] transition-opacity group-hover/avatar:opacity-100 disabled:cursor-wait"
                    >
                        <IconCamera size={22} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                </div>

                <div className="flex-1">
                    <AnimatePresence mode="wait" initial={false}>
                        {!editing ? (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="font-display text-[24px] font-semibold text-ink">{user.name}</h1>
                                    <Button size="sm" variant="outline" icon={<IconEdit size={13} />} onClick={startEditing}>
                                        Edit profile
                                    </Button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-ink-soft">
                                    <span className="flex items-center gap-1.5">
                                        <IconMail size={14} className="text-ink-faint" /> {user.email}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <IconGlobe size={14} className="text-ink-faint" />
                                        {LANGUAGES.find((l) => l.code === user.language)?.label ?? user.language}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        {tripList.length} trip{tripList.length === 1 ? '' : 's'}
                                    </span>
                                </div>

                                <div className="mt-6 border-t border-border-soft pt-4">
                                    {!confirmingDelete ? (
                                        <button
                                            type="button"
                                            onClick={() => setConfirmingDelete(true)}
                                            className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-ink-faint transition-colors hover:text-coral-ink"
                                        >
                                            <IconTrash size={13} /> Delete account
                                        </button>
                                    ) : (
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="text-[13px] text-ink-soft">
                                                This permanently deletes your account and trips. Are you sure?
                                            </span>
                                            <Button size="sm" variant="soft" onClick={handleDelete} disabled={isDeleting}>
                                                {isDeleting ? 'Deleting…' : 'Yes, delete'}
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="edit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleSave}
                            >
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Field label="Name">
                                        <Input
                                            value={draft.name}
                                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                        />
                                    </Field>
                                    <Field label="Email">
                                        <Input value={user.email} disabled className="cursor-not-allowed opacity-60" />
                                    </Field>
                                    <Field label="Language">
                                        <select
                                            value={draft.language}
                                            onChange={(e) => setDraft({ ...draft, language: e.target.value })}
                                            className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[14.5px] text-ink outline-none transition-all focus:border-coral focus:ring-4 focus:ring-coral-soft"
                                        >
                                            {LANGUAGES.map((l) => (
                                                <option key={l.code} value={l.code}>
                                                    {l.label}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>
                                {saveError && <p className="mt-2.5 text-[13px] text-coral-ink">{saveError}</p>}
                                <div className="mt-4 flex items-center gap-2.5">
                                    <Button type="submit" size="sm" disabled={isSaving}>
                                        {isSaving ? 'Saving…' : 'Save changes'}
                                    </Button>
                                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <section className="mt-12">
                <SectionHeading
                    eyebrow={`${upcoming.length} trip${upcoming.length === 1 ? '' : 's'}`}
                    title="Upcoming & ongoing trips"
                    action={
                        <Button size="sm" variant="soft" icon={<IconPlus size={14} />} onClick={() => navigate('/trips/new')}>
                            Plan a trip
                        </Button>
                    }
                />
                {isTripsLoading ? (
                    <PageLoader />
                ) : upcoming.length === 0 ? (
                    <p className="mt-5 text-[14px] text-ink-soft">No trips planned yet. Start one whenever you're ready.</p>
                ) : (
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {upcoming.map((t, i) => (
                            <TripCard
                                key={t.id}
                                name={t.name}
                                dates={formatDateRange(t.start_date, t.end_date)}
                                status={STATUS_LABEL[getTripStatus(t.start_date, t.end_date)]}
                                tone={TONES[i % TONES.length]}
                                index={i}
                                onView={() => navigate(`/trips/${t.id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {!isTripsLoading && past.length > 0 && (
                <section className="mt-12">
                    <SectionHeading title="Previous trips" />
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {past.map((t, i) => (
                            <TripCard
                                key={t.id}
                                name={t.name}
                                dates={formatDateRange(t.start_date, t.end_date)}
                                status={STATUS_LABEL.completed}
                                tone={TONES[i % TONES.length]}
                                index={i}
                                onView={() => navigate(`/trips/${t.id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
