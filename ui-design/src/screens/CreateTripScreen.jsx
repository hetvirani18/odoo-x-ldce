import { motion } from "motion/react";
import { TopBar } from "../components/TopBar.jsx";
import { Button, Field, Input, SectionHeading } from "../components/ui.jsx";
import { PlaceCard } from "../components/cards.jsx";
import { placeSuggestions, regions } from "../data/mock.js";
import { IconArrowRight, IconCalendar, IconPin } from "../components/icons.jsx";

export function CreateTripScreen({ onNavigate }) {
  return (
    <div>
      <TopBar active="tripListing" onNavigate={onNavigate} onProfile={() => onNavigate("profile")} onCreateTrip={() => onNavigate("createTrip")} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">New trip</p>
          <h1 className="font-display text-[30px] font-semibold text-ink">Plan a new trip</h1>
          <p className="mt-2 max-w-lg text-[14.5px] text-ink-soft">
            Set the shape of your trip first — dates and destination — then pick from ideas
            we've lined up below.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          onSubmit={(e) => {
            e.preventDefault();
            onNavigate("buildItinerary");
          }}
          className="mt-8 grid grid-cols-1 gap-4 rounded-[28px] border border-border-soft bg-surface p-6 sm:grid-cols-2 sm:p-8"
        >
          <Field label="Select a place" className="sm:col-span-2">
            <Input icon={<IconPin size={17} />} placeholder="Paris, France" defaultValue="Paris, France" />
          </Field>
          <Field label="Start date">
            <Input icon={<IconCalendar size={17} />} type="date" defaultValue="2026-04-04" />
          </Field>
          <Field label="End date">
            <Input icon={<IconCalendar size={17} />} type="date" defaultValue="2026-04-11" />
          </Field>

          <div className="mt-2 flex items-center justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onNavigate("landing")}>
              Cancel
            </Button>
            <Button type="submit" icon={<IconArrowRight size={16} />}>
              Continue to itinerary
            </Button>
          </div>
        </motion.form>

        <section className="mt-14 pb-16">
          <SectionHeading eyebrow="Get inspired" title="Suggestions for places to visit / activities to perform" />
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {placeSuggestions.map((p, i) => (
              <PlaceCard key={p} label={p} tone={regions[i % regions.length].tone} index={i} onClick={() => onNavigate("activitySearch")} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
