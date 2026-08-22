import { useRef } from "react";
import { motion } from "motion/react";
import { Badge, Button, Card } from "./ui.jsx";
import { IconArrowRight, IconCalendar, IconCamera, IconPin, IconWallet } from "./icons.jsx";
import { resolveAssetUrl } from "../../lib/utils.js";
import { useUploadTripPhotoMutation } from "../../features/trips/tripsApi.js";

const gradients = {
  coral:
    "radial-gradient(120% 100% at 0% 0%, oklch(72% 0.14 40) 0%, oklch(58% 0.15 25) 100%)",
  teal: "radial-gradient(120% 100% at 0% 0%, oklch(60% 0.09 195) 0%, oklch(38% 0.07 220) 100%)",
  gold: "radial-gradient(120% 100% at 0% 0%, oklch(82% 0.12 85) 0%, oklch(64% 0.13 55) 100%)",
};

export function RegionCard({ name, country, imageUrl, tone = "coral", index = 0 }) {
  const resolvedImageUrl = resolveAssetUrl(imageUrl);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group relative aspect-[4/5] shrink-0 w-[168px] cursor-pointer overflow-hidden rounded-3xl bg-cover bg-center text-white shadow-[0_16px_30px_-16px_rgba(30,15,5,0.4)]"
      style={resolvedImageUrl ? { backgroundImage: `url(${resolvedImageUrl})` } : { background: gradients[tone] }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/10 transition-opacity group-hover:from-black/65" />
      <div className="relative flex h-full flex-col justify-end p-4">
        <p className="font-display text-[16px] font-semibold leading-tight">{name}</p>
        <p className="text-[12px] text-white/75">{country}</p>
      </div>
    </motion.div>
  );
}

export function TripCard({ id, name, dates, status, budget, cities, photoUrl, tone = "coral", onView, index = 0 }) {
  const fileInputRef = useRef(null);
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadTripPhotoMutation();
  const resolvedPhotoUrl = resolveAssetUrl(photoUrl);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !id) return;
    const formData = new FormData();
    formData.append("photo", file);
    try {
      await uploadPhoto({ id, formData }).unwrap();
    } catch {
      // Ignored — the banner simply stays as-is if the upload fails.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
    >
      <Card className="overflow-hidden">
        <div
          className="group/banner relative h-28 w-full bg-cover bg-center"
          style={resolvedPhotoUrl ? { backgroundImage: `url(${resolvedPhotoUrl})` } : { background: gradients[tone] }}
        >
          {resolvedPhotoUrl && <div className="absolute inset-0 bg-black/15" />}
          {cities && cities[0] && (
            <p className="absolute bottom-2.5 left-3.5 text-[11.5px] font-medium text-white/85">
              {cities[0]}
            </p>
          )}
          {id && (
            <>
              <button
                type="button"
                title="Set cover photo"
                disabled={isUploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2.5 top-2.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/25 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/banner:opacity-100 disabled:cursor-wait disabled:opacity-100"
              >
                <IconCamera size={15} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-[16px] font-semibold text-ink">{name}</p>
            {status && <Badge tone={tone}>{status}</Badge>}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-faint">
            <IconCalendar size={13} /> {dates}
          </p>
          {cities && (
            <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-soft">
              <IconPin size={13} className="text-ink-faint" />
              {cities.join(" · ")}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-3.5">
            {budget && (
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <IconWallet size={14} className="text-ink-faint" /> {budget}
              </span>
            )}
            <Button size="sm" variant="ghost" icon={<IconArrowRight size={14} />} onClick={onView} className="ml-auto">
              View
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function PlaceCard({ label, tone = "coral", index = 0, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="group flex aspect-square cursor-pointer flex-col justify-end overflow-hidden rounded-2xl p-4 text-left text-white"
      style={{ background: gradients[tone] }}
    >
      <p className="font-display text-[14px] font-semibold leading-tight">{label}</p>
    </motion.button>
  );
}
