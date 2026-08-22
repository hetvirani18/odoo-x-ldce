import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconCheck, IconLink, IconShare } from './icons.jsx';
import { Button } from './ui.jsx';
import { useShareTripMutation, useUnshareTripMutation } from '../../features/trips/tripsApi.js';

export function SharePanel({ trip }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shareTrip, { isLoading: isSharing }] = useShareTripMutation();
    const [unshareTrip, { isLoading: isUnsharing }] = useUnshareTripMutation();

    if (!trip) return null;

    const isPublic = Boolean(trip.is_public);
    const shareUrl = trip.share_token
        ? `${window.location.origin}/t/${trip.share_token}`
        : `${window.location.origin}/t/${trip.id}`;

    const handleToggle = async () => {
        try {
            if (isPublic) {
                await unshareTrip(trip.id).unwrap();
            } else {
                await shareTrip(trip.id).unwrap();
            }
        } catch (err) {
            console.error('Failed to toggle public share status:', err);
        }
    };

    const handleCopy = () => {
        if (navigator?.clipboard) {
            navigator.clipboard.writeText(shareUrl);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="relative">
            <Button
                size="sm"
                variant="outline"
                icon={<IconShare size={14} />}
                onClick={() => setOpen((v) => !v)}
            >
                Share
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute right-0 top-[calc(100%+10px)] z-20 w-[320px] rounded-2xl border border-border-soft bg-surface p-4 shadow-[0_20px_50px_-18px_rgba(20,10,5,0.35)]"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[13.5px] font-medium text-ink">Public link</p>
                                <p className="mt-0.5 text-[12px] text-ink-faint">
                                    Anyone with the link can view a read-only itinerary
                                </p>
                            </div>
                            <button
                                role="switch"
                                aria-checked={isPublic}
                                disabled={isSharing || isUnsharing}
                                onClick={handleToggle}
                                className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                                    isPublic ? 'bg-coral' : 'bg-surface-2 border border-border'
                                }`}
                            >
                                <motion.span
                                    layout
                                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                                    style={{ left: isPublic ? 22 : 2 }}
                                />
                            </button>
                        </div>

                        <AnimatePresence>
                            {isPublic && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
                                        <IconLink size={13} className="shrink-0 text-ink-faint" />
                                        <span className="flex-1 truncate text-[12px] text-ink-soft select-all">
                                            {shareUrl}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopy}
                                            className="cursor-pointer text-[12px] font-semibold text-coral-ink transition-colors hover:text-coral"
                                        >
                                            {copied ? <IconCheck size={14} /> : 'Copy'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
