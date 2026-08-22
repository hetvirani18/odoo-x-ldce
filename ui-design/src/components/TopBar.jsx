import { motion } from "motion/react";
import { IconCompass, IconLogOut, IconPlus, IconUser } from "./icons.jsx";
import { Button } from "./ui.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";
import { AccountMenu } from "./AccountMenu.jsx";

export function TopBar({ active, onNavigate, onProfile, onCreateTrip }) {
  const links = [
    { id: "landing", label: "Explore" },
    { id: "tripListing", label: "My Trips" },
    { id: "community", label: "Community" },
    { id: "calendar", label: "Calendar" },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6">
        <button
          onClick={() => onNavigate("landing")}
          className="flex cursor-pointer items-center gap-2 text-ink"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white">
            <IconCompass size={19} />
          </span>
          <span className="font-display text-[19px] font-semibold tracking-tight">
            GlobeTrotter
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-border-soft bg-surface p-1 md:flex">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => onNavigate(l.id)}
              className={`relative rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors cursor-pointer ${
                active === l.id ? "text-bg" : "text-ink-soft hover:text-ink"
              }`}
            >
              {active === l.id && (
                <motion.span
                  layoutId="topnav-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{l.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="soft" icon={<IconPlus size={15} />} onClick={onCreateTrip} className="hidden sm:inline-flex">
            Plan a trip
          </Button>
          <ThemeToggle />
          <AccountMenu
            items={[
              { label: "View profile", icon: <IconUser size={15} className="text-ink-faint" />, onClick: onProfile },
              { label: "Log out", icon: <IconLogOut size={15} />, tone: "danger", onClick: () => onNavigate("login") },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
