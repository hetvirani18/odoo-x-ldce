import { Outlet } from "react-router";
import { motion } from "motion/react";
import { IconCompass, IconGlobe, IconPin } from "../ui/icons.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen">
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-canvas lg:block">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 90% at 15% 0%, oklch(66% 0.17 35) 0%, transparent 55%), radial-gradient(110% 90% at 100% 100%, oklch(52% 0.08 200) 0%, transparent 55%), var(--color-canvas)",
          }}
        />
        <svg className="absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 400 800" fill="none">
          <path d="M40 700 Q120 500 90 380 T180 160" stroke="white" strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" />
          <path d="M300 120 Q260 300 330 420 T260 680" stroke="white" strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" />
        </svg>

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <IconCompass size={20} />
            </span>
            <span className="font-display text-xl font-semibold">GlobeTrotter</span>
          </div>

          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight">
              Plan trips that feel like they planned themselves.
            </h2>
            <p className="mt-3 max-w-sm text-[15px] text-white/70">
              Build itineraries, track budgets, and share your travels — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-white/70">
            <span className="flex items-center gap-1.5">
              <IconGlobe size={15} /> 140+ countries
            </span>
            <span className="flex items-center gap-1.5">
              <IconPin size={15} /> 40k+ itineraries built
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-14 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
