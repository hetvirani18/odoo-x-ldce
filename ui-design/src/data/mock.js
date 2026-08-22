export const regions = [
  { name: "Kyoto", country: "Japan", tone: "coral" },
  { name: "Santorini", country: "Greece", tone: "teal" },
  { name: "Lisbon", country: "Portugal", tone: "gold" },
  { name: "Banff", country: "Canada", tone: "coral" },
  { name: "Marrakech", country: "Morocco", tone: "teal" },
];

export const previousTrips = [
  { name: "Japan Adventure", dates: "Mar 12 – Mar 24", tone: "coral" },
  { name: "Greek Island Hop", dates: "Jun 3 – Jun 15", tone: "teal" },
  { name: "Lisbon Weekender", dates: "Sep 8 – Sep 12", tone: "gold" },
];

export const upcomingTrips = [
  {
    name: "Paris in Bloom",
    dates: "Apr 4 – Apr 11, 2026",
    status: "Upcoming",
    budget: "$2,450",
    cities: ["Paris", "Versailles"],
    tone: "coral",
  },
];

export const ongoingTrips = [
  {
    name: "NYC Getaway",
    dates: "Aug 20 – Aug 27, 2026",
    status: "Ongoing",
    budget: "$1,180",
    cities: ["New York"],
    tone: "teal",
  },
];

export const completedTrips = [
  {
    name: "Japan Adventure",
    dates: "Mar 12 – Mar 24, 2026",
    status: "Completed",
    budget: "$3,020",
    cities: ["Tokyo", "Kyoto", "Osaka"],
    tone: "gold",
  },
  {
    name: "5 Days in Rome",
    dates: "Jan 15 – Jan 20, 2026",
    status: "Completed",
    budget: "$1,760",
    cities: ["Rome"],
    tone: "coral",
  },
];

export const placeSuggestions = [
  "Eiffel Tower Sunset Tour",
  "Louvre Museum Skip-the-Line",
  "Seine River Dinner Cruise",
  "Montmartre Walking Tour",
  "Versailles Day Trip",
  "French Cooking Class",
];

export const itinerarySections = [
  {
    title: "Section 1",
    subtitle: "Flights & arrival — Paris CDG",
    dateRange: "Apr 4 → Apr 4",
    budget: "$540",
  },
  {
    title: "Section 2",
    subtitle: "Hôtel Lumière, 6th Arrondissement",
    dateRange: "Apr 4 → Apr 11",
    budget: "$980",
  },
  {
    title: "Section 3",
    subtitle: "Louvre + Seine cruise + Montmartre",
    dateRange: "Apr 5 → Apr 8",
    budget: "$430",
  },
];

export const activityResults = [
  { name: "Sunrise Paragliding, Chamonix", meta: "2.5 hrs · Easy · from $145" },
  { name: "Tandem Paraglide over Annecy Lake", meta: "1.5 hrs · Beginner · from $120" },
  { name: "Alpine Paragliding + Photo Package", meta: "3 hrs · Moderate · from $210" },
  { name: "Sunset Paragliding, Verbier", meta: "2 hrs · Easy · from $165" },
  { name: "Paragliding + Via Ferrata Combo", meta: "5 hrs · Advanced · from $260" },
  { name: "Family Tandem Flight, Interlaken", meta: "1 hr · Easy · from $110" },
  { name: "Cross-Country Thermal Flight", meta: "4 hrs · Expert · from $310" },
];

export const dayOnePlan = [
  { name: "Arrive · Paris CDG → Hotel transfer", expense: "$65" },
  { name: "Check-in · Hôtel Lumière", expense: "$0" },
  { name: "Evening Seine River walk", expense: "$0" },
];

export const dayTwoPlan = [
  { name: "Louvre Museum, guided tour", expense: "$58" },
  { name: "Lunch · Café Marly", expense: "$34" },
  { name: "Montmartre & Sacré-Cœur walk", expense: "$0" },
];

// Publicly shared trips — backed by `trips.is_public` + `trips.share_token`
// (docs/database-design.md, docs/backend-architecture.md §3.7). Each row here
// is what GET /api/public/trips/:shareToken would return: owner, trip, dates,
// cities. No likes/comments — that data doesn't exist in the schema.
export const sharedTrips = [
  {
    owner: "Priya N.",
    trip: "Kyoto in cherry blossom season",
    dates: "Mar 18 – Mar 24, 2026",
    cities: ["Kyoto"],
    tone: "coral",
  },
  {
    owner: "Marco D.",
    trip: "Budget week in Lisbon",
    dates: "Feb 2 – Feb 9, 2026",
    cities: ["Lisbon", "Sintra"],
    tone: "teal",
  },
  {
    owner: "Aiko T.",
    trip: "Solo hiking, Banff National Park",
    dates: "Jul 11 – Jul 14, 2026",
    cities: ["Banff"],
    tone: "gold",
  },
  {
    owner: "Yusuf K.",
    trip: "Marrakech souks & desert combo",
    dates: "May 5 – May 9, 2026",
    cities: ["Marrakech", "Agafay Desert"],
    tone: "coral",
  },
];

export const calendarEvents = {
  5: { label: "Paris Trip", tone: "coral" },
  9: { label: "NYC Getaway", tone: "teal", range: true },
  15: { label: "NYC Getaway", tone: "teal" },
  16: { label: "Japan Adventure", tone: "gold" },
  18: { label: "15–22", tone: "gold", range: true },
  23: { label: "NYC Getaway", tone: "teal" },
};

export const popularCities = [
  { name: "Kyoto, Japan", visits: 1284, trend: "+18%" },
  { name: "Lisbon, Portugal", visits: 963, trend: "+9%" },
  { name: "Santorini, Greece", visits: 887, trend: "+24%" },
  { name: "Banff, Canada", visits: 612, trend: "+6%" },
  { name: "Marrakech, Morocco", visits: 540, trend: "+31%" },
];

export const popularActivities = [
  { name: "Guided walking tours", pct: 82 },
  { name: "Museum & heritage visits", pct: 68 },
  { name: "Food & cooking classes", pct: 54 },
  { name: "Hiking & nature trails", pct: 47 },
  { name: "Water sports", pct: 33 },
];

export const adminUsers = [
  { name: "Priya N.", email: "priya.n@example.com", trips: 4, status: "Active" },
  { name: "Marco D.", email: "marco.d@example.com", trips: 2, status: "Active" },
  { name: "Aiko T.", email: "aiko.t@example.com", trips: 7, status: "Active" },
  { name: "Yusuf K.", email: "yusuf.k@example.com", trips: 1, status: "Suspended" },
  { name: "Elena R.", email: "elena.r@example.com", trips: 5, status: "Active" },
];

export const analyticsTrend = [12, 19, 15, 24, 21, 30, 27, 34];

export const tripsBySeason = [
  { label: "Spring", value: 38 },
  { label: "Summer", value: 62 },
  { label: "Autumn", value: 27 },
  { label: "Winter", value: 15 },
];
