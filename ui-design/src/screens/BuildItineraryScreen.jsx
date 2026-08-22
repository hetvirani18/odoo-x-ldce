import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TopBar } from "../components/TopBar.jsx";
import { Button, Field, Input } from "../components/ui.jsx";
import { itinerarySections } from "../data/mock.js";
import { IconArrowRight, IconCalendar, IconPlus, IconWallet } from "../components/icons.jsx";

export function BuildItineraryScreen({ onNavigate }) {
  const [sections, setSections] = useState(itinerarySections);

  return (
    <div>
      <TopBar active="tripListing" onNavigate={onNavigate} onProfile={() => onNavigate("profile")} onCreateTrip={() => onNavigate("createTrip")} />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">Paris in Bloom</p>
            <h1 className="font-display text-[28px] font-semibold text-ink">Build your itinerary</h1>
          </div>
          <Button variant="dark" icon={<IconArrowRight size={16} />} onClick={() => onNavigate("itineraryBudget")}>
            View itinerary
          </Button>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {sections.map((s, i) => (
              <motion.div
                key={s.title}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-[26px] border border-border-soft bg-surface p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[17px] font-semibold text-ink">{s.title}</p>
                    <p className="mt-1 text-[13.5px] text-ink-soft">{s.subtitle}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-faint">
                      All the necessary information about this section — travel, hotel, or any other activity.
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 font-display text-[13px] font-semibold text-ink-soft">
                    {i + 1}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <Field label="Date range">
                    <Input icon={<IconCalendar size={16} />} defaultValue={s.dateRange} />
                  </Field>
                  <Field label="Budget for this section">
                    <Input icon={<IconWallet size={16} />} defaultValue={s.budget} />
                  </Field>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            setSections((prev) => [
              ...prev,
              {
                title: `Section ${prev.length + 1}`,
                subtitle: "New section — add details",
                dateRange: "— to —",
                budget: "$0",
              },
            ])
          }
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[26px] border border-dashed border-border py-5 text-[14px] font-medium text-ink-soft transition-colors hover:border-coral hover:text-coral-ink"
        >
          <IconPlus size={16} /> Add another section
        </motion.button>
      </main>
    </div>
  );
}
