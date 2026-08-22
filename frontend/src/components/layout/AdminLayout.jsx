import { Outlet, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { AdminTopBar } from "./AdminTopBar.jsx";
import { useLogoutMutation } from "../../features/auth/authApi.js";
import { api } from "../../app/api.js";

export default function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout().unwrap().catch(() => {});
    // Drop all cached query data (not just invalidate) so the login page never
    // reads a stale "still admin" result before the real 401 comes back.
    dispatch(api.util.resetApiState());
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg">
      <AdminTopBar onLogout={handleLogout} />
      <Outlet />
    </div>
  );
}
