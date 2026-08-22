import { Navigate, Outlet } from 'react-router';
import { useGetMeQuery } from '../features/auth/authApi';
import { PageLoader } from '../components/ui/Loading.jsx';

export default function ProtectedRoute() {
    const { data: me, isLoading, isError } = useGetMeQuery();

    if (isLoading) return <PageLoader />;
    if (isError || !me) return <Navigate to="/login" replace />;
    return <Outlet />;
}
