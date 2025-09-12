import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "../store/supabaseAuth";
import { supabase } from "../lib/supabase";
import { GraduationCap, LogOut } from "lucide-react";
import { getDicebearUrl } from "../utils/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { titleCase } from "../utils/format";

export default function Navbar() {
  const { user } = useSupabaseAuth();
  const location = useLocation();
  const { discipline } = useParams();
  const navigate = useNavigate();

  const isGlobePage =
  location.pathname.startsWith("/globe") ||
  location.pathname.startsWith("/learning");


  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header
      className={`z-50 transition-all duration-500
        ${
          isGlobePage
            ? "fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6)] px-6 py-2"
            : "sticky top-0 inset-x-0 bg-white/60 backdrop-blur-lg border-b border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
        }`}
    >
      <div
        className={`flex items-center justify-between relative ${
          isGlobePage ? "" : "max-w-7xl mx-auto px-6 py-3"
        }`}
      >
        {/* Left: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold transition-transform hover:scale-105"
        >
          <GraduationCap
            className={`w-5 h-5 sm:w-6 sm:h-6 ${
              isGlobePage ? "text-cyan-400" : "text-blue-600"
            }`}
          />
          <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${
              isGlobePage
                ? "from-cyan-400 to-fuchsia-500"
                : "from-blue-600 to-purple-600"
            }`}
          >
            ConnectEdu
          </span>
        </Link>

        {/* Center: Discipline pill */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <AnimatePresence>
            {discipline && (
              <motion.div
                key={discipline}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <div
                  className={`px-5 py-1.5 rounded-full backdrop-blur-md border shadow flex items-center justify-center gap-4 max-w-[70vw] ${
                    isGlobePage
                      ? "bg-black/50 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                      : "bg-white/70 border-white/40 shadow-lg"
                  }`}
                >
                  {/* Text */}
                  <span
                    className={`text-sm font-semibold ${
                      isGlobePage ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Global Top 10 in
                    <span className="inline-block mx-2 text-gray-400 font-normal select-none">
                      •
                    </span>
                    <span
                      className={`font-extrabold text-lg tracking-wide bg-gradient-to-r bg-clip-text text-transparent ${
                        isGlobePage
                          ? "from-cyan-300 via-pink-400 to-fuchsia-600"
                          : "from-blue-600 via-purple-600 to-pink-600"
                      }`}
                      style={{ letterSpacing: "0.03em" }}
                    >
                      {titleCase(discipline)}
                    </span>
                  </span>

                  {/* Button */}
                  <button
                    onClick={() => navigate(`/learning/${discipline}`)}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium shadow hover:from-indigo-700 hover:to-purple-700 transition whitespace-nowrap"
                  >
                    Learning Hub
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Auth */}
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                state={{ from: location.pathname }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow hover:shadow-lg transition ${
                  isGlobePage
                    ? "bg-black/40 border-white/20"
                    : "bg-white/70 border-white/30"
                }`}
              >
                {user.avatarSeed ? (
                  <img
                    src={getDicebearUrl(user.avatarSeed)}
                    alt="avatar"
                    className="w-7 h-7 rounded-full border border-white/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                    {user.name?.[0] ?? "?"}
                  </div>
                )}
                <span
                  className={`text-sm font-semibold ${
                    isGlobePage ? "text-white/90" : "text-gray-700"
                  }`}
                >
                  {user.name || "Profile"}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className={`p-2 rounded-full transition ${
                  isGlobePage
                    ? "hover:bg-red-500/20 text-white/70 hover:text-red-400"
                    : "hover:bg-red-50 text-gray-500 hover:text-red-600"
                }`}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition"
            >
              Login / Register
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
