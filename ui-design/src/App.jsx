import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ScreenRail } from "./components/ScreenRail.jsx";
import { ThemeProvider } from "./hooks/useTheme.jsx";

import { LoginScreen } from "./screens/LoginScreen.jsx";
import { RegisterScreen } from "./screens/RegisterScreen.jsx";
import { LandingScreen } from "./screens/LandingScreen.jsx";
import { CreateTripScreen } from "./screens/CreateTripScreen.jsx";
import { BuildItineraryScreen } from "./screens/BuildItineraryScreen.jsx";
import { TripListingScreen } from "./screens/TripListingScreen.jsx";
import { ProfileScreen } from "./screens/ProfileScreen.jsx";
import { ActivitySearchScreen } from "./screens/ActivitySearchScreen.jsx";
import { ItineraryBudgetScreen } from "./screens/ItineraryBudgetScreen.jsx";
import { CommunityScreen } from "./screens/CommunityScreen.jsx";
import { CalendarScreen } from "./screens/CalendarScreen.jsx";
import { AdminScreen } from "./screens/AdminScreen.jsx";

const SCREENS = [
  { id: "login", label: "1 · Login", Component: LoginScreen },
  { id: "register", label: "2 · Registration", Component: RegisterScreen },
  { id: "landing", label: "3 · Main landing page", Component: LandingScreen },
  { id: "createTrip", label: "4 · Create a new trip", Component: CreateTripScreen },
  { id: "buildItinerary", label: "5 · Build itinerary", Component: BuildItineraryScreen },
  { id: "tripListing", label: "6 · User trip listing", Component: TripListingScreen },
  { id: "profile", label: "7 · User profile", Component: ProfileScreen },
  { id: "activitySearch", label: "8 · Activity / city search", Component: ActivitySearchScreen },
  { id: "itineraryBudget", label: "9 · Itinerary + budget view", Component: ItineraryBudgetScreen },
  { id: "community", label: "10 · Community", Component: CommunityScreen },
  { id: "calendar", label: "11 · Calendar view", Component: CalendarScreen },
  { id: "admin", label: "12 · Admin panel", Component: AdminScreen },
];

export default function App() {
  const [screenId, setScreenId] = useState("login");
  const active = SCREENS.find((s) => s.id === screenId) ?? SCREENS[0];
  const Screen = active.Component;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={screenId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <Screen onNavigate={setScreenId} />
          </motion.div>
        </AnimatePresence>

        <ScreenRail screens={SCREENS} active={screenId} onNavigate={setScreenId} />
      </div>
    </ThemeProvider>
  );
}
