import { motion } from "motion/react";
import { TopBar } from "../components/TopBar.jsx";
import { SearchToolbar, SectionHeading, Button } from "../components/ui.jsx";
import { RegionCard, TripCard } from "../components/cards.jsx";
import { regions, previousTrips } from "../data/mock.js";
import { IconArrowRight, IconPlus } from "../components/icons.jsx";

export function LandingScreen({ onNavigate }) {
  return (
    <div>
      <TopBar active="landing" onNavigate={onNavigate} onProfile={() => onNavigate("profile")} onCreateTrip={() => onNavigate("createTrip")} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[28px] px-8 py-14 text-white sm:px-14 sm:py-20"
          style={{
            background:
              "radial-gradient(120% 140% at 10% 10%, oklch(68% 0.16 40) 0%, transparent 55%), radial-gradient(110% 130% at 95% 100%, oklch(45% 0.09 205) 0%, transparent 55%), var(--color-canvas)",
          }}
        >
          <svg className="absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 800 400" fill="none">
            <path d="M0 320 Q200 200 400 260 T800 180" stroke="white" strokeWidth="1.5" strokeDasharray="2 12" />
          </svg>
          <div className="relative max-w-xl">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Your next escape
            </p>
            <h1 className="font-display text-[38px] font-semibold leading-[1.1] sm:text-[48px]">
              Where to next, Het?
            </h1>
            <p className="mt-4 max-w-md text-[15px] text-white/75">
              Build a day-by-day itinerary, track budget as you go, and pull ideas from a
              community of people who've already been there.
            </p>
            <Button size="lg" className="mt-7" icon={<IconPlus size={16} />} onClick={() => onNavigate("createTrip")}>
              Plan a trip
            </Button>
          </div>
        </motion.div>

        <div className="mt-10">
          <SearchToolbar placeholder="Search destinations, trips, activities…" />
        </div>

        <section className="mt-12">
          <SectionHeading
            eyebrow="Handpicked"
            title="Top regional selections"
            action={
              <button className="hidden items-center gap-1 text-[13px] font-medium text-ink-soft hover:text-ink sm:flex" onClick={() => onNavigate("activitySearch")}>
                See all <IconArrowRight size={14} />
              </button>
            }
          />
          <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
            {regions.map((r, i) => (
              <RegionCard key={r.name} {...r} index={i} />
            ))}
          </div>
        </section>

        <section className="mt-14 pb-16">
          <SectionHeading
            eyebrow="Look back"
            title="Previous trips"
            action={
              <Button size="sm" variant="outline" icon={<IconPlus size={14} />} onClick={() => onNavigate("createTrip")}>
                Plan a trip
              </Button>
            }
          />
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {previousTrips.map((t, i) => (
              <TripCard key={t.name} name={t.name} dates={t.dates} tone={t.tone} index={i} onView={() => onNavigate("itineraryBudget")} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
