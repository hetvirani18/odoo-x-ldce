import { TopBar } from "../components/TopBar.jsx";
import { SearchToolbar, SectionHeading } from "../components/ui.jsx";
import { TripCard } from "../components/cards.jsx";
import { ongoingTrips, upcomingTrips, completedTrips } from "../data/mock.js";

function TripGroup({ title, trips, onNavigate }) {
  if (!trips.length) return null;
  return (
    <section className="mt-11 first:mt-0">
      <SectionHeading title={title} />
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((t, i) => (
          <TripCard key={t.name + t.dates} {...t} index={i} onView={() => onNavigate("itineraryBudget")} />
        ))}
      </div>
    </section>
  );
}

export function TripListingScreen({ onNavigate }) {
  return (
    <div>
      <TopBar active="tripListing" onNavigate={onNavigate} onProfile={() => onNavigate("profile")} onCreateTrip={() => onNavigate("createTrip")} />

      <main className="mx-auto max-w-6xl px-6 py-10 pb-20">
        <h1 className="font-display text-[28px] font-semibold text-ink">Your trips</h1>
        <p className="mt-1.5 text-[14.5px] text-ink-soft">Everything you've planned, in progress, or already lived.</p>

        <div className="mt-7">
          <SearchToolbar placeholder="Search your trips…" />
        </div>

        <TripGroup title="Ongoing" trips={ongoingTrips} onNavigate={onNavigate} />
        <TripGroup title="Upcoming" trips={upcomingTrips} onNavigate={onNavigate} />
        <TripGroup title="Completed" trips={completedTrips} onNavigate={onNavigate} />
      </main>
    </div>
  );
}
