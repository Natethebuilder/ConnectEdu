import { GraduationCap, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useSupabaseAuth } from "../store/supabaseAuth";
import { useNavigate } from "react-router-dom";
import EduLogo from "../components/EduLogo";

export default function Login() {
  const { setRole } = useSupabaseAuth();
  const navigate = useNavigate();

  const selectRole = (role: "student" | "alumni") => {
    setRole(role);
    navigate("/auth");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating blobs */}
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      {/* Brand logo (centered above card) */}
      <EduLogo size={72} />

      {/* Role Select Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-lg mt-8 p-10 rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/40"
      >
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Continue as
        </h2>

        <div className="grid gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => selectRole("student")}
            className="w-full flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-white p-8 shadow-md hover:shadow-xl transition"
          >
            <GraduationCap className="h-14 w-14 text-blue-600 mb-4" />
            <span className="text-lg font-semibold text-gray-800">Student</span>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Find universities, explore programs, and connect with alumni.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => selectRole("alumni")}
            className="w-full flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-white p-8 shadow-md hover:shadow-xl transition"
          >
            <Users className="h-14 w-14 text-green-600 mb-4" />
            <span className="text-lg font-semibold text-gray-800">Alumni</span>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Share your experience and guide the next generation.
            </p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
