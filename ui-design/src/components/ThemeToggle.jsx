import { AnimatePresence, motion } from "motion/react";
import { IconMoon, IconSun } from "./icons.jsx";
import { useTheme } from "../hooks/useTheme.jsx";

export function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle dark mode"
      className={`relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-ink-soft transition-colors hover:border-ink hover:text-ink ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? <IconMoon size={17} /> : <IconSun size={17} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
