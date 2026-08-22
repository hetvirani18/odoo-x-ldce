import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { IconCompass, IconLogOut, IconShield, IconGlobe, IconBarChart, IconTrendingUp } from '../ui/icons.jsx';
import { Badge } from '../ui/ui.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { AccountMenu } from './AccountMenu.jsx';
import { useGetMeQuery } from '../../features/auth/authApi.js';

const ADMIN_TABS = [
    { path: '/admin/users', label: 'Manage users', icon: IconShield },
    { path: '/admin/cities', label: 'Popular cities', icon: IconGlobe },
    { path: '/admin/activities', label: 'Popular activities', icon: IconBarChart },
    { path: '/admin/stats', label: 'User trends & analytics', icon: IconTrendingUp },
];

export function AdminTopBar({ onLogout }) {
    const { pathname } = useLocation();
    const { data: me } = useGetMeQuery();

    return (
        <header className="sticky top-0 z-30 border-b border-border-soft bg-bg/85 backdrop-blur-md">
            <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-6">
                <Link to="/admin/users" className="flex shrink-0 cursor-pointer items-center gap-2.5 text-ink">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg">
                        <IconCompass size={19} />
                    </span>
                    <span className="hidden font-display text-[19px] font-semibold tracking-tight sm:inline">
                        GlobeTrotter
                    </span>
                    <Badge tone="neutral" className="ml-1">
                        Admin
                    </Badge>
                </Link>

                <nav className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-full border border-border-soft bg-surface p-1">
                    {ADMIN_TABS.map((t) => {
                        const Icon = t.icon;
                        const isActive = pathname === t.path;
                        return (
                            <Link
                                key={t.path}
                                to={t.path}
                                className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                                    isActive ? 'text-bg' : 'text-ink-soft hover:text-ink'
                                }`}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="admin-tab-pill"
                                        className="absolute inset-0 rounded-full bg-ink"
                                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                    />
                                )}
                                <span className="relative flex items-center gap-1.5">
                                    <Icon size={13} />
                                    {t.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex shrink-0 items-center gap-3">
                    <ThemeToggle />
                    <AccountMenu
                        name={me?.name || 'Administrator'}
                        email={me?.email || 'admin@globetrotter.io'}
                        avatar={me?.avatar_url}
                        tone="ink"
                        items={[
                            {
                                label: 'Log out',
                                icon: <IconLogOut size={15} />,
                                tone: 'danger',
                                onClick: onLogout,
                            },
                        ]}
                    />
                </div>
            </div>
        </header>
    );
}
