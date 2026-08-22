import { Navigate, Outlet } from 'react-router';
import { useGetMeQuery } from '../features/auth/authApi';
import { PageLoader } from '../components/ui/Loading.jsx';

export default function AdminRoute() {
    const { data: me, isLoading, isError } = useGetMeQuery();

    if (isLoading) return <PageLoader />;
    if (isError || !me || me.role !== 'admin') return <Navigate to="/admin/login" replace />;
    return <Outlet />;
}
