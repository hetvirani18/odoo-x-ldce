import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconArrowDown, IconLayers } from "./icons.jsx";

export function ScreenRail({ screens, active, onNavigate }) {
  const [open, setOpen] = useState(false);
  const activeScreen = screens.find((s) => s.id === active);

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="absolute bottom-16 left-1/2 mb-2 w-[300px] -translate-x-1/2 rounded-3xl border border-border-soft bg-surface p-2 shadow-[0_24px_60px_-20px_rgba(20,10,5,0.35)]"
          >
            <p className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Jump to screen
            </p>
            <div className="grid max-h-[50vh] grid-cols-1 gap-0.5 overflow-y-auto">
              {screens.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onNavigate(s.id);
                    setOpen(false);
                  }}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors ${
                    active === s.id
                      ? "bg-ink text-bg"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                      active === s.id ? "bg-bg/20 text-bg" : "bg-surface-2 text-ink-faint"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.96 }}
        className="flex cursor-pointer items-center gap-2.5 rounded-full border border-border bg-ink px-5 py-3 text-bg shadow-[0_16px_40px_-14px_rgba(20,10,5,0.5)]"
      >
        <IconLayers size={15} />
        <span className="text-[13px] font-medium">{activeScreen?.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <IconArrowDown size={14} />
        </motion.span>
      </motion.button>
    </div>
  );
}
