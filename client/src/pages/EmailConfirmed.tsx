import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function EmailConfirmed() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40 max-w-md text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Email Confirmed!
        </h1>

        <p className="text-gray-600 mt-4">
          Your email verification was successful. You can now log in with your updated email.
        </p>

        <Link
          to="/login"
          className="inline-block mt-6 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:opacity-90"
        >
          Go to Login
        </Link>

        <p className="text-gray-400 text-xs mt-2">(Redirecting automatically...)</p>
      </motion.div>
    </div>
  );
}
