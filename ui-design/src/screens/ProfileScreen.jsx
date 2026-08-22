import { motion } from "motion/react";
import { TopBar } from "../components/TopBar.jsx";
import { Avatar, Button, SectionHeading } from "../components/ui.jsx";
import { TripCard } from "../components/cards.jsx";
import { previousTrips, upcomingTrips, ongoingTrips } from "../data/mock.js";
import { IconEdit, IconGlobe, IconMail, IconPhone, IconPin } from "../components/icons.jsx";

const preplanned = [...upcomingTrips, ...ongoingTrips];

export function ProfileScreen({ onNavigate }) {
  return (
    <div>
      <TopBar active="profile" onNavigate={onNavigate} onProfile={() => onNavigate("profile")} onCreateTrip={() => onNavigate("createTrip")} />

      <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6 rounded-[28px] border border-border-soft bg-surface p-6 sm:flex-row sm:items-center sm:p-8"
        >
          <Avatar initials="HV" size={92} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[24px] font-semibold text-ink">Het Virani</h1>
              <Button size="sm" variant="outline" icon={<IconEdit size={13} />}>
                Edit profile
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-ink-soft">
              <span className="flex items-center gap-1.5">
                <IconMail size={14} className="text-ink-faint" /> hetvirani87@gmail.com
              </span>
              <span className="flex items-center gap-1.5">
                <IconPhone size={14} className="text-ink-faint" /> +91 98765 43210
              </span>
              <span className="flex items-center gap-1.5">
                <IconPin size={14} className="text-ink-faint" /> Ahmedabad, India
              </span>
              <span className="flex items-center gap-1.5">
                <IconGlobe size={14} className="text-ink-faint" /> 6 trips · 3 countries
              </span>
            </div>
          </div>
        </motion.div>

        <section className="mt-12">
          <SectionHeading title="Preplanned trips" />
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {preplanned.map((t, i) => (
              <TripCard key={t.name} {...t} index={i} onView={() => onNavigate("itineraryBudget")} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <SectionHeading title="Previous trips" />
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
