import { useState } from "react";
import { motion } from "motion/react";
import { AdminTopBar } from "../components/AdminTopBar.jsx";
import { SearchToolbar, Badge, Card } from "../components/ui.jsx";
import { BarChart, DonutChart, LineChart } from "../components/charts.jsx";
import { adminUsers, popularActivities, popularCities, analyticsTrend, tripsBySeason } from "../data/mock.js";
import { IconBarChart, IconGlobe, IconPieChart, IconShield, IconTrendingUp } from "../components/icons.jsx";

const tabs = [
  { id: "users", label: "Manage users", icon: IconShield },
  { id: "cities", label: "Popular cities", icon: IconGlobe },
  { id: "activities", label: "Popular activities", icon: IconBarChart },
  { id: "analytics", label: "User trends & analytics", icon: IconTrendingUp },
];

const tabCopy = {
  users:
    "Manage the users and their actions. View trip history per user, and suspend accounts.",
  cities: "Lists the most-visited cities based on current user trip data, updated daily.",
  activities: "Lists the most-booked activities based on current user trend data.",
  analytics: "Cross-cutting analysis across seasons, spend, and destinations to inform product decisions.",
};

export function AdminScreen({ onNavigate }) {
  const [tab, setTab] = useState("analytics");

  return (
    <div>
      <AdminTopBar tabs={tabs} activeTab={tab} onTabChange={setTab} onNavigate={onNavigate} />

      <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
        <h1 className="font-display text-[28px] font-semibold text-ink">{tabs.find((t) => t.id === tab).label}</h1>
        <p className="mt-1.5 max-w-lg text-[14.5px] text-ink-soft">{tabCopy[tab]}</p>

        <div className="mt-6">
          <SearchToolbar placeholder="Search users, cities, activities…" />
        </div>

        <div className="mt-7">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {tab === "users" && (
              <Card className="overflow-hidden p-0">
                <table className="w-full text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b border-border-soft bg-surface-2 text-[12px] uppercase tracking-wide text-ink-faint">
                      <th className="px-5 py-3.5 font-semibold">Name</th>
                      <th className="px-5 py-3.5 font-semibold">Email</th>
                      <th className="px-5 py-3.5 font-semibold">Trips</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u.email} className="border-b border-border-soft last:border-0">
                        <td className="px-5 py-3.5 font-medium text-ink">{u.name}</td>
                        <td className="px-5 py-3.5 text-ink-soft">{u.email}</td>
                        <td className="px-5 py-3.5 text-ink-soft">{u.trips}</td>
                        <td className="px-5 py-3.5">
                          <Badge tone={u.status === "Active" ? "teal" : "coral"}>{u.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {tab === "cities" && (
              <Card className="flex flex-col divide-y divide-[var(--color-border-soft)] p-2">
                {popularCities.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-[12px] font-semibold text-ink-soft">
                        {i + 1}
                      </span>
                      <p className="text-[14px] text-ink">{c.name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[12.5px]">
                      <span className="text-ink-faint">{c.visits.toLocaleString()} visits</span>
                      <Badge tone="teal">{c.trend}</Badge>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {tab === "activities" && (
              <Card className="flex flex-col gap-3.5 p-6">
                {popularActivities.map((a) => (
                  <div key={a.name}>
                    <div className="mb-1.5 flex items-center justify-between text-[13.5px]">
                      <span className="text-ink">{a.name}</span>
                      <span className="text-ink-faint">{a.pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${a.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-coral"
                      />
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {tab === "analytics" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Card className="p-6 sm:col-span-2">
                  <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <IconTrendingUp size={15} className="text-coral-ink" /> Trips created per week
                  </p>
                  <p className="mb-4 text-[12.5px] text-ink-faint">Last 8 weeks</p>
                  <LineChart data={analyticsTrend} />
                </Card>
                <Card className="p-6">
                  <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <IconPieChart size={15} className="text-teal-ink" /> Trips by season
                  </p>
                  <p className="mb-5 text-[12.5px] text-ink-faint">Share of all trips this year</p>
                  <DonutChart data={tripsBySeason.map((s) => ({ label: s.label, value: s.value }))} />
                </Card>
                <Card className="p-6">
                  <p className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <IconBarChart size={15} className="text-coral-ink" /> Top activities booked
                  </p>
                  <p className="mb-4 text-[12.5px] text-ink-faint">By % of active users</p>
                  <BarChart data={popularActivities.slice(0, 4).map((a) => ({ label: a.name.split(" ")[0], value: a.pct }))} />
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
