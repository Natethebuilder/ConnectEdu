// client/src/App.tsx
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useSupabaseAuth } from "./store/supabaseAuth";

export default function App() {
  const location = useLocation();
  const { user } = useSupabaseAuth();

  // Hide Navbar on auth/login/register pages
  const hideNavbar = ["/login", "/auth"].includes(location.pathname);

  return (
    <div className="h-full flex flex-col">
      {!hideNavbar && user && <Navbar />}
      <div className="flex-1 relative">
        <Outlet />
      </div>
    </div>
  );
}
