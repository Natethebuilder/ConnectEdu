// client/src/pages/DisciplineSelect.tsx
import { motion } from "framer-motion";
import {
  BookOpen,
  FlaskConical,
  Cpu,
  Atom,
  Wrench,
  Calculator,
  Brain,
  PenTool,
  Megaphone,
  Globe2,
  Building2,
  Stethoscope,
  Database,
  Leaf,
  GraduationCap,
  Briefcase,
  Scale,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "../store/supabaseAuth";

// Expanded disciplines
const disciplines = [
  { name: "Physics", icon: Atom, color: "from-blue-500 to-purple-500" },
  { name: "Chemistry", icon: FlaskConical, color: "from-pink-500 to-red-500" },
  { name: "Biology", icon: Leaf, color: "from-green-500 to-emerald-500" }, // 🌱 Leaf
  { name: "Computer Science", icon: Cpu, color: "from-indigo-500 to-cyan-500" },
  { name: "Engineering", icon: Wrench, color: "from-amber-500 to-orange-600" },
  { name: "Mathematics", icon: Calculator, color: "from-slate-600 to-slate-800" },
  { name: "Data Science", icon: Database, color: "from-cyan-500 to-sky-600" },
  { name: "Economics & Business", icon: Briefcase, color: "from-yellow-500 to-amber-600" }, // 💼
  { name: "Psychology", icon: Brain, color: "from-rose-500 to-pink-600" },
  { name: "Education", icon: GraduationCap, color: "from-fuchsia-500 to-purple-600" }, // 🎓
  { name: "Law & Political Science", icon: Scale, color: "from-gray-500 to-gray-700" }, // ⚖️
  { name: "Art & Design", icon: PenTool, color: "from-violet-500 to-fuchsia-600" },
  { name: "Communications & Media", icon: Megaphone, color: "from-teal-500 to-emerald-600" },
  { name: "Environmental Science", icon: Globe2, color: "from-green-600 to-lime-600" },
  { name: "Architecture", icon: Building2, color: "from-stone-500 to-stone-700" },
  { name: "Medicine & Healthcare", icon: Stethoscope, color: "from-red-500 to-rose-600" },
  { name: "History & Literature", icon: BookOpen, color: "from-indigo-700 to-purple-800" },
];

// Framer Motion variants for staggered entry
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
};

export default function DisciplineSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSupabaseAuth();

  const suggestion = location.state?.suggestion as string | undefined;
  const scores = (location.state?.scores || {}) as Record<string, number>;

  const selectDiscipline = (discipline: string) => {
    navigate(`/globe/${discipline.toLowerCase().replace(/\s+/g, "-")}`);
  };

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
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 px-6 py-6">
              <p className="text-gray-700 text-lg">🎯 Based on your answers, we recommend:</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{suggestion}</h3>
              <p className="text-xs text-gray-500 mt-2">
                This is guidance only — you decide your path.
              </p>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              onClick={() =>
                navigate("/survey-results", { state: { suggestion, scores } })
              }
              className="mt-4 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm hover:bg-white"
            >
              Why this recommendation?
            </motion.button>

            </div>
          </motion.div>
        )}

        {/* Wrapper flex centers the last row */}
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="show"
  className="flex flex-wrap justify-center gap-8 w-full max-w-6xl"
>
  {disciplines.map((d) => (
    <motion.button
      key={d.name}
      variants={itemVariants}
      whileHover={{
        scale: 1.07,
        rotate: -1,
        boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
      }}
      whileTap={{ scale: 0.97 }}
      onClick={() => selectDiscipline(d.name)}
      className={`w-72 flex flex-col items-center justify-center p-8 rounded-2xl shadow-md text-white font-semibold text-lg bg-gradient-to-br ${d.color} relative overflow-hidden`}
    >
      {suggestion === d.name && (
        <motion.span
          layoutId="highlight"
          className="absolute inset-0 rounded-2xl ring-4 ring-blue-400 pointer-events-none"
        />
      )}
      <d.icon className="w-12 h-12 mb-3" />
      {d.name}
    </motion.button>
  ))}
</motion.div>




        {/* Actions */}
        <div className="mt-10 flex items-center gap-4">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 8px 20px rgba(0,0,0,0.1)", // subtle glow
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            onClick={() => navigate("/survey")}
            className="px-8 py-3 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm hover:bg-white"
          >
            I’m not sure yet
          </motion.button>



        </div>
      </main>
    </div>
  );
}
