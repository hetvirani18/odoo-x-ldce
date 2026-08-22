import { Outlet, useNavigate } from "react-router";
import { TopBar } from "./TopBar.jsx";
import { useLogoutMutation } from "../../features/auth/authApi.js";

export default function AppLayout() {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout().unwrap().catch(() => {});
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg">
      <TopBar onLogout={handleLogout} />
      <Outlet />
    </div>
  );
}
