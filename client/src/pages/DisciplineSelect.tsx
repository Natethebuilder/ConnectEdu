// client/src/pages/DisciplineSelect.tsx
import { motion } from "framer-motion";
import {
  BookOpen,
  FlaskConical,
  Cpu,
  Atom,
  HelpCircle,
  Wrench,
  Calculator,
  Landmark,
  Brain,
  PenTool,
  Megaphone,
  Globe2,
  Building2,
  Stethoscope,
  Database,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "../store/supabaseAuth";

// Expanded disciplines (research-backed breadth)
const disciplines = [
  { name: "Physics", icon: Atom, color: "from-blue-500 to-purple-500" },
  { name: "Chemistry", icon: FlaskConical, color: "from-pink-500 to-red-500" },
  { name: "Biology", icon: BookOpen, color: "from-green-500 to-emerald-500" },
  { name: "Computer Science", icon: Cpu, color: "from-indigo-500 to-cyan-500" },
  { name: "Engineering", icon: Wrench, color: "from-amber-500 to-orange-600" },
  { name: "Mathematics", icon: Calculator, color: "from-slate-600 to-slate-800" },
  { name: "Data Science", icon: Database, color: "from-cyan-500 to-sky-600" },
  { name: "Economics & Business", icon: Landmark, color: "from-yellow-500 to-amber-600" },
  { name: "Psychology", icon: Brain, color: "from-rose-500 to-pink-600" },
  { name: "Education", icon: BookOpen, color: "from-fuchsia-500 to-purple-600" },
  { name: "Law & Political Science", icon: Landmark, color: "from-gray-500 to-gray-700" },
  { name: "Art & Design", icon: PenTool, color: "from-violet-500 to-fuchsia-600" },
  { name: "Communications & Media", icon: Megaphone, color: "from-teal-500 to-emerald-600" },
  { name: "Environmental Science", icon: Globe2, color: "from-green-600 to-lime-600" },
  { name: "Architecture", icon: Building2, color: "from-stone-500 to-stone-700" },
  { name: "Medicine & Healthcare", icon: Stethoscope, color: "from-red-500 to-rose-600" },
  { name: "History & Literature", icon: BookOpen, color: "from-indigo-700 to-purple-800" },
  { name: "I don't know", icon: HelpCircle, color: "from-gray-400 to-gray-600" },
];

export default function DisciplineSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSupabaseAuth();

  const suggestion = location.state?.suggestion as string | undefined;
  const scores = (location.state?.scores || {}) as Record<string, number>;

  const selectDiscipline = (discipline: string) => {
    if (discipline === "I don't know") {
      navigate("/survey");
    } else {
      navigate(`/globe/${discipline.toLowerCase().replace(/\s+/g, "-")}`);
    }
  };

  // Compute top-3 scores for a fun, gamified reveal
  const top3 = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Floating blobs background */}
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      {/* Main content */}
      <main className="flex flex-col items-center justify-center flex-1 relative z-10 w-full px-6 py-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-extrabold text-gray-800 mb-6 text-center"
        >
          Choose your discipline
        </motion.h2>

        {/* Recommendation card */}
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 max-w-xl w-full text-center"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 px-6 py-6">
              <p className="text-gray-700 text-lg">
                🎯 Based on your answers, we recommend:
              </p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">
                {suggestion}
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                This is guidance only — you decide your path.
              </p>

              <button
                onClick={() => navigate("/survey-results", { state: { suggestion, scores } })}
                className="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow hover:opacity-90 transition"
              >
                Why this recommendation?
              </button>
            </div>
          </motion.div>
        )}


        {/* Disciplines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {disciplines.map((d, i) => (
            <motion.button
              key={d.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectDiscipline(d.name)}
              className={`flex flex-col items-center justify-center p-8 rounded-2xl shadow-md text-white font-semibold text-lg bg-gradient-to-br ${d.color} hover:shadow-2xl transition relative overflow-hidden`}
            >
              {suggestion === d.name && (
                <span className="absolute inset-0 ring-4 ring-blue-400 rounded-2xl pointer-events-none" />
              )}
              <d.icon className="w-12 h-12 mb-3" />
              {d.name}
            </motion.button>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={() => navigate("/survey")}
            className="px-5 py-2 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow hover:bg-white transition text-gray-700 text-sm"
          >
            Retake survey
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow hover:bg-white transition text-gray-700 text-sm"
          >
            Back to home
          </button>
        </div>
      </main>
    </div>
  );
}
