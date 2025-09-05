// client/src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "../store/supabaseAuth";
import { supabase } from "../lib/supabase";
import { GraduationCap } from "lucide-react";
import { getDicebearUrl } from  "../utils/avatar";

export default function Navbar() {
  const { user } = useSupabaseAuth();
  const location = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-blue-50/70 to-purple-50/70 backdrop-blur-md border-b border-gray-200/40">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition"
        >
          <GraduationCap className="w-6 h-6 text-blue-600" />
          ConnectEdu
        </Link>

        {/* Right side */}
        <nav className="flex items-center gap-6">
          {user ? (
            <>
              

            <Link
        to="/profile"
        state={{ from: location.pathname }} // 👈 pass origin
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium"
      >
        {user.avatarSeed ? (
          <img
            src={getDicebearUrl(user.avatarSeed)}
            alt="avatar"
            className="w-8 h-8 rounded-full border border-gray-300"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
            {user.name?.[0] ?? "?"}
          </div>
        )}
        <span>{user.name || "Profile"}</span>
      </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm text-gray-700 hover:text-blue-600 transition"
            >
              Login / Register
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
