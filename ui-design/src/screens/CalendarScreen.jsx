import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TopBar } from "../components/TopBar.jsx";
import { SearchToolbar } from "../components/ui.jsx";
import { IconButton } from "../components/ui.jsx";
import { IconChevronLeft, IconChevronRight } from "../components/icons.jsx";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const tripEvents = {
  "2026-4": {
    4: { label: "Paris Trip", tone: "coral", span: 4 },
    18: { label: "Chamonix Day Trip", tone: "teal" },
    26: { label: "Versailles", tone: "gold" },
  },
  "2026-8": {
    9: { label: "NYC Getaway", tone: "teal", span: 3 },
    20: { label: "NYC Getaway", tone: "teal" },
  },
};

const toneDot = { coral: "bg-coral", teal: "bg-teal", gold: "bg-gold" };
const toneBg = { coral: "bg-coral-soft text-coral-ink", teal: "bg-teal-soft text-teal-ink", gold: "bg-gold-soft text-gold-ink" };

function buildMonth(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export function CalendarScreen({ onNavigate }) {
  const [cursor, setCursor] = useState(new Date(2026, 3, 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonth(year, month), [year, month]);
  const events = tripEvents[`${year}-${month}`] || {};
  const today = new Date(2026, 7, 22);

  const shift = (delta) => setCursor(new Date(year, month + delta, 1));

  return (
    <div>
      <TopBar active="calendar" onNavigate={onNavigate} onProfile={() => onNavigate("profile")} onCreateTrip={() => onNavigate("createTrip")} />

      <main className="mx-auto max-w-5xl px-6 py-10 pb-20">
        <h1 className="font-display text-[28px] font-semibold text-ink">Calendar view</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-soft">See every trip laid across the month.</p>

        <div className="mt-6">
          <SearchToolbar placeholder="Search trips…" />
        </div>

        <div className="mt-8 overflow-hidden rounded-[28px] border border-border-soft bg-surface">
          <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
            <IconButton onClick={() => shift(-1)}>
              <IconChevronLeft size={17} />
            </IconButton>
            <AnimatePresence mode="wait">
              <motion.h2
                key={`${year}-${month}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="font-display text-[19px] font-semibold text-ink"
              >
                {MONTHS[month]} {year}
              </motion.h2>
            </AnimatePresence>
            <IconButton onClick={() => shift(1)}>
              <IconChevronRight size={17} />
            </IconButton>
          </div>

          <div className="grid grid-cols-7 border-b border-border-soft px-3 py-3 sm:px-5">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[11.5px] font-semibold uppercase tracking-wide text-ink-faint">
                {w}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${year}-${month}-grid`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-7 gap-1.5 p-3 sm:p-5"
            >
              {cells.map((d, i) => {
                const ev = d ? events[d] : null;
                const isToday = d && year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
                return (
                  <div
                    key={i}
                    className={`flex min-h-[84px] flex-col gap-1.5 rounded-xl p-2 text-left sm:min-h-[96px] sm:p-2.5 ${
                      d ? "bg-surface-2/60" : ""
                    }`}
                  >
                    {d && (
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium ${
                          isToday ? "bg-ink text-bg" : "text-ink-soft"
                        }`}
                      >
                        {d}
                      </span>
                    )}
                    {ev && (
                      <span className={`truncate rounded-md px-1.5 py-1 text-[10.5px] font-semibold leading-tight ${toneBg[ev.tone]}`}>
                        <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${toneDot[ev.tone]}`} />
                        {ev.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
