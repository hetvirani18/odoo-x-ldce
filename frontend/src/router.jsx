import { createBrowserRouter } from 'react-router';
import AppLayout from './components/layout/AppLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import AuthLayout from './components/layout/AuthLayout.jsx';
import ProtectedRoute from './routing/ProtectedRoute.jsx';
import AdminRoute from './routing/AdminRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import CreateTripPage from './pages/CreateTripPage.jsx';
import BuildItineraryPage from './pages/BuildItineraryPage.jsx';
import TripListingPage from './pages/TripListingPage.jsx';
import TripDetailPage from './pages/TripDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import PublicTripPage from './pages/PublicTripPage.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminStatsPage from './pages/admin/AdminStatsPage.jsx';

export const router = createBrowserRouter([
    {
        element: <AuthLayout />,
        children: [
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
            { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/', element: <LandingPage /> },
                    { path: '/trips', element: <TripListingPage /> },
                    { path: '/trips/new', element: <CreateTripPage /> },
                    { path: '/trips/:tripId', element: <TripDetailPage /> },
                    { path: '/trips/:tripId/build', element: <BuildItineraryPage /> },
                    { path: '/profile', element: <ProfilePage /> },
                    { path: '/search', element: <SearchPage /> },
                    { path: '/community', element: <CommunityPage /> },
                    { path: '/calendar', element: <CalendarPage /> },
                ],
            },
        ],
    },
    { path: '/t/:shareToken', element: <PublicTripPage /> },
    { path: '/admin/login', element: <AdminLoginPage /> },
    {
        element: <AdminRoute />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { path: '/admin/users', element: <AdminUsersPage /> },
                    { path: '/admin/stats', element: <AdminStatsPage /> },
                ],
            },
        ],
    },
]);
