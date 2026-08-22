import { motion } from "motion/react";
import { TopBar } from "../components/TopBar.jsx";
import { SearchToolbar, Avatar, Button } from "../components/ui.jsx";
import { sharedTrips } from "../data/mock.js";
import { IconArrowRight, IconCalendar, IconPin } from "../components/icons.jsx";

export function CommunityScreen({ onNavigate }) {
  return (
    <div>
      <TopBar active="community" onNavigate={onNavigate} onProfile={() => onNavigate("profile")} onCreateTrip={() => onNavigate("createTrip")} />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-10 pb-20 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-ink">Community</h1>
          <p className="mt-1.5 max-w-lg text-[14.5px] text-ink-soft">
            Browse itineraries other travelers have chosen to make public.
          </p>

          <div className="mt-6">
            <SearchToolbar placeholder="Search shared trips, cities…" />
          </div>

          <div className="mt-7 flex flex-col gap-3.5">
            {sharedTrips.map((t, i) => (
              <motion.article
                key={t.owner + t.trip}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ y: -2 }}
                className="flex flex-wrap items-center gap-4 rounded-3xl border border-border-soft bg-surface p-5 transition-shadow hover:shadow-[0_14px_30px_-18px_rgba(30,15,5,0.3)] sm:flex-nowrap"
              >
                <Avatar
                  initials={t.owner.split(" ").map((n) => n[0]).join("")}
                  tone={t.tone === "gold" ? "coral" : t.tone}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-[14.5px] font-semibold text-ink">{t.trip}</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-faint">
                    <span>shared by {t.owner}</span>
                    <span className="flex items-center gap-1.5">
                      <IconCalendar size={12} /> {t.dates}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IconPin size={12} /> {t.cities.join(" · ")}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<IconArrowRight size={13} />}
                  onClick={() => onNavigate("itineraryBudget")}
                  className="shrink-0"
                >
                  View itinerary
                </Button>
              </motion.article>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-border-soft bg-surface-2 p-6 lg:sticky lg:top-24">
          <p className="font-display text-[15px] font-semibold text-ink">About this space</p>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
            When a traveler makes a trip public, it gets a shareable read-only link. This page
            is a directory of those links.
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
            Use search, group by, filter, and sort to narrow results down to a city, date range,
            or traveler.
          </p>
        </aside>
      </main>
    </div>
  );
}
