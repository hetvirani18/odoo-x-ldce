import { motion } from "motion/react";
import { TopBar } from "../components/TopBar.jsx";
import { SearchToolbar } from "../components/ui.jsx";
import { activityResults } from "../data/mock.js";
import { IconArrowRight, IconHeart, IconPin } from "../components/icons.jsx";

export function ActivitySearchScreen({ onNavigate }) {
  return (
    <div>
      <TopBar active="landing" onNavigate={onNavigate} onProfile={() => onNavigate("profile")} onCreateTrip={() => onNavigate("createTrip")} />

      <main className="mx-auto max-w-4xl px-6 py-10 pb-20">
        <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-coral-ink">
          Activity search
        </p>
        <h1 className="font-display text-[28px] font-semibold text-ink">Find something to do</h1>

        <div className="mt-6">
          <SearchToolbar placeholder="Paragliding…" value="Paragliding" onChange={() => {}} />
        </div>

        <p className="mt-8 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
          {activityResults.length} results near Chamonix, France
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {activityResults.map((r, i) => (
            <motion.button
              key={r.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              whileHover={{ x: 3 }}
              onClick={() => onNavigate("itineraryBudget")}
              className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border-soft bg-surface p-5 text-left transition-colors hover:border-ink"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-soft text-teal-ink">
                  <IconPin size={18} />
                </span>
                <div>
                  <p className="text-[14.5px] font-medium text-ink">{r.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-faint">{r.meta}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ink-faint transition-colors group-hover:text-coral-ink">
                  <IconHeart size={17} />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-soft transition-colors group-hover:bg-ink group-hover:text-bg">
                  <IconArrowRight size={14} />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
