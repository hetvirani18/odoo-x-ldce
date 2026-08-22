import { Outlet, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { TopBar } from "./TopBar.jsx";
import { useLogoutMutation } from "../../features/auth/authApi.js";
import { api } from "../../app/api.js";

export default function AppLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout().unwrap().catch(() => {});
    dispatch(api.util.resetApiState());
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg">
      <TopBar onLogout={handleLogout} />
      <Outlet />
    </div>
  );
}
