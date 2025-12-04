import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useSupabaseAuth } from "./store/supabaseAuth";

export default function App() {
  const location = useLocation();
  const { user, initAuth } = useSupabaseAuth();

  // Run once on app load
  useEffect(() => {
    initAuth();
  }, []);

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
