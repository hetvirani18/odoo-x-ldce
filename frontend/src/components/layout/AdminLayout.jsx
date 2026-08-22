import { Outlet, useNavigate } from "react-router";
import { AdminTopBar } from "./AdminTopBar.jsx";
import { useLogoutMutation } from "../../features/auth/authApi.js";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout().unwrap().catch(() => {});
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg">
      <AdminTopBar onLogout={handleLogout} />
      <Outlet />
    </div>
  );
}
