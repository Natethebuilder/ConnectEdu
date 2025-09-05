// client/src/pages/DisciplineChoice.tsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function DisciplineChoice() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating animated blobs */}
      <motion.div
        animate={{ y: [0, 40, 0], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute top-24 left-16 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -40, 0], opacity: [0.25, 0.6, 0.25] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute bottom-24 right-16 w-[28rem] h-[28rem] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      {/* Question */}
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="text-4xl sm:text-5xl font-extrabold text-gray-800 text-center leading-snug mb-16 max-w-3xl"
      >
        Do you already know{" "}
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          what discipline
        </span>{" "}
        you want to study?
      </motion.h2>

      {/* Interactive pill buttons */}
      <div className="flex gap-8">
        <motion.button
          whileHover={{
            scale: 1.1,
            boxShadow: "0px 10px 25px rgba(79,70,229,0.35)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => navigate("/disciplines")}
          className="px-12 py-4 rounded-full text-white font-semibold text-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95"
        >
          Yes
        </motion.button>

        <motion.button
          whileHover={{
            scale: 1.1,
            boxShadow: "0px 10px 25px rgba(0,0,0,0.15)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => navigate("/survey")}
          className="px-12 py-4 rounded-full text-gray-700 font-semibold text-lg shadow-md bg-white/80 border border-gray-200 hover:bg-white"
        >
          No
        </motion.button>
      </div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 text-base text-gray-500 text-center"
      >
        Don’t worry, you can always explore both paths later
      </motion.p>
    </div>
  );
}
