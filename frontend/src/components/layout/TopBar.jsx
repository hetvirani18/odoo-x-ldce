import { motion } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router";
import { IconCompass, IconLogOut, IconPlus, IconUser } from "../ui/icons.jsx";
import { Button } from "../ui/ui.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";
import { AccountMenu } from "./AccountMenu.jsx";
import { useGetMeQuery } from "../../features/auth/authApi.js";
import { resolveAssetUrl } from "../../lib/utils.js";

export function TopBar({ onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: me } = useGetMeQuery();
  const links = [
    { path: "/", label: "Explore" },
    { path: "/trips", label: "My Trips" },
    { path: "/community", label: "Community" },
    { path: "/calendar", label: "Calendar" },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex cursor-pointer items-center gap-2 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white">
            <IconCompass size={19} />
          </span>
          <span className="font-display text-[19px] font-semibold tracking-tight">
            GlobeTrotter
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border-soft bg-surface p-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`relative rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors cursor-pointer ${
                pathname === l.path ? "text-bg" : "text-ink-soft hover:text-ink"
              }`}
            >
              {pathname === l.path && (
                <motion.span
                  layoutId="topnav-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="soft" icon={<IconPlus size={15} />} onClick={() => navigate("/trips/new")} className="hidden sm:inline-flex">
            Plan a trip
          </Button>
          <ThemeToggle />
          <AccountMenu
            name={me?.user?.name}
            email={me?.user?.email}
            photoUrl={resolveAssetUrl(me?.user?.photo_url)}
            items={[
              { label: "View profile", icon: <IconUser size={15} className="text-ink-faint" />, onClick: () => navigate("/profile") },
              { label: "Log out", icon: <IconLogOut size={15} />, tone: "danger", onClick: onLogout },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
