import { motion } from "motion/react";
import { TopBar } from "../components/TopBar.jsx";
import { SearchToolbar } from "../components/ui.jsx";
import { dayOnePlan, dayTwoPlan } from "../data/mock.js";
import { IconWallet } from "../components/icons.jsx";

function DayBlock({ label, items, index }) {
  const total = items.reduce((sum, it) => sum + Number(it.expense.replace(/\D/g, "") || 0), 0);
  return (
    <div className="relative">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-full bg-ink px-4 py-1.5 font-display text-[13px] font-semibold text-bg">
          {label}
        </span>
        <span className="text-[12.5px] text-ink-faint">${total} planned</span>
      </div>

      <div className="relative flex flex-col">
        {items.map((it, i) => (
          <motion.div
            key={it.name}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index * 3 + i) * 0.05, duration: 0.35 }}
            className="relative flex items-stretch gap-4 pb-4 last:pb-0"
          >
            {i < items.length - 1 && (
              <span className="absolute left-[13px] top-9 h-[calc(100%-14px)] w-px bg-border" />
            )}
            <span className="relative z-10 mt-1 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 border-coral bg-surface" />

            <div className="flex flex-1 items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface px-5 py-4">
              <p className="text-[14px] text-ink">{it.name}</p>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-[12.5px] font-semibold text-teal-ink">
                <IconWallet size={12} /> {it.expense}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ItineraryBudgetScreen({ onNavigate }) {
  const days = [
    { label: "Day 1", items: dayOnePlan },
    { label: "Day 2", items: dayTwoPlan },
  ];
  const grandTotal = days
    .flatMap((d) => d.items)
    .reduce((sum, it) => sum + Number(it.expense.replace(/\D/g, "") || 0), 0);

  return (
    <div>
      <TopBar active="tripListing" onNavigate={onNavigate} onProfile={() => onNavigate("profile")} onCreateTrip={() => onNavigate("createTrip")} />

      <main className="mx-auto max-w-3xl px-6 py-10 pb-20">
        <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">Paris in Bloom</p>
        <h1 className="font-display text-[28px] font-semibold text-ink">Itinerary for Paris</h1>

        <div className="mt-6">
          <SearchToolbar placeholder="Search activities in this trip…" />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface-2 px-5 py-4">
          <p className="text-[13.5px] text-ink-soft">7 nights · 2 cities · 6 planned activities</p>
          <p className="flex items-center gap-1.5 font-display text-[16px] font-semibold text-ink">
            <IconWallet size={16} className="text-ink-faint" /> ${grandTotal} total
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-10">
          {days.map((d, i) => (
            <DayBlock key={d.label} label={d.label} items={d.items} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
