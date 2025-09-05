// client/src/pages/SurveyResults.tsx
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Atom,
  FlaskConical,
  BookOpen,
  Cpu,
  Wrench,
  Calculator,
  Database,
  Brain,
  PenTool,
  Megaphone,
  Globe2,
  Building2,
  Stethoscope,
  HelpCircle,
  Leaf,
  GraduationCap,
  Briefcase,
  Scale,
} from "lucide-react";

import { useState } from "react";
import { disciplineExplanations } from "../utils/disciplineExplanations";

const icons: Record<string, any> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Leaf,              // 🌱 life sciences → Leaf
  "Computer Science": Cpu,
  Engineering: Wrench,
  Mathematics: Calculator,
  "Data Science": Database,
  "Economics & Business": Briefcase, // 💼 fits better than Landmark
  Psychology: Brain,
  Education: GraduationCap,   // 🎓 teaching/learning
  "Law & Political Science": Scale, // ⚖️ balance of justice
  "Art & Design": PenTool,
  "Communications & Media": Megaphone,
  "Environmental Science": Globe2,
  Architecture: Building2,
  "Medicine & Healthcare": Stethoscope,
  "History & Literature": BookOpen,
  "I don't know": HelpCircle,
};


export default function SurveyResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAll, setShowAll] = useState(false);

  const suggestion = location.state?.suggestion as string | null;
  const scores = (location.state?.scores || {}) as Record<string, number>;

  // Sort disciplines
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* floating background blobs */}
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      <main className="relative z-10 w-full max-w-5xl mx-auto p-6 md:p-10 space-y-10">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Survey Results
          </h1>
          <p className="text-gray-600 mt-2">
            Based on your answers, here’s the discipline that best matches your
            profile, plus explanations for your top areas.
          </p>
        </div>

        {/* Recommendation Card */}
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-blue-200 text-center relative"
          >
            {icons[suggestion] &&
              (() => {
                const Icon = icons[suggestion];
                return <Icon className="w-16 h-16 mx-auto mb-4 text-blue-600" />;
              })()}
            <h2 className="text-2xl font-bold text-gray-900">
              🎯 Recommended Discipline:{" "}
              <span className="text-blue-600">{suggestion}</span>
            </h2>
            <p className="text-gray-600 mt-2">
              This is our top match for you based on your survey responses.
            </p>
          </motion.div>
        )}

        {/* Top 3 grid */}
        {top3.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              Your Top 3 Matches
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {top3.map(([disc, score], i) => {
                const Icon = icons[disc];
                return (
                  <motion.div
                    key={disc}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-white/80 backdrop-blur-xl shadow border border-white/40 text-center"
                  >
                    {Icon && <Icon className="w-10 h-10 mx-auto mb-2 text-purple-600" />}
                    <p className="font-semibold">{disc}</p>
                    <p className="text-sm text-gray-500">Score: {score.toFixed(1)}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Explanations */}
<div>
  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
    Why These Recommendations?
  </h3>

  <ol className="space-y-4 list-none"> 
    {[...top3, ...(showAll ? rest : [])].map(([disc, score], i) => {
      const explanation = disciplineExplanations[disc];
      const isTop = i === 0; // auto-expand the top one

      return (
        <motion.li
          key={disc}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="relative"
        >
          


          <motion.details
            open={isTop}
            className="group rounded-2xl bg-white/80 backdrop-blur-lg shadow-lg border border-white/40 overflow-hidden transition hover:shadow-xl"
          >
            <summary className="cursor-pointer flex items-center justify-between px-5 py-4 select-none text-gray-900 font-medium">
  <div className="flex items-center gap-3">
    {/* Rank Badge */}
    <span
      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md
        ${
          i === 0
            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white" // gold
            : i === 1
            ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white" // silver
            : i === 2
            ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white" // bronze
            : "bg-gray-200 text-gray-700" // subtle for others
        }`}
    >
      {i + 1}
    </span>

    {/* Discipline Name + Score */}
    <span>
      {disc}
      <span className="text-sm text-gray-500 ml-1">
        (Score {score.toFixed(1)})
      </span>
    </span>
  </div>

  {/* Dropdown Arrow */}
  <motion.span className="ml-3 text-gray-400 group-open:rotate-180 transition-transform">
    ▼
  </motion.span>
</summary>

            <div
              className="px-5 pb-5 text-gray-700 text-sm leading-relaxed prose prose-sm prose-blue max-w-none"
              dangerouslySetInnerHTML={{
                __html: explanation || "No explanation available.",
              }}
            />
          </motion.details>
        </motion.li>
      );
    })}
  </ol>

  {/* Toggle button */}
  {rest.length > 0 && (
    <div className="flex justify-center mt-6">
      <button
        onClick={() => setShowAll((prev) => !prev)}
        className="px-5 py-2 rounded-full text-sm font-medium bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 hover:bg-white shadow transition"
      >
        {showAll ? "Show Less" : "Show All"}
      </button>
    </div>
  )}
</div>


        {/* Actions */}
        <div className="flex justify-center gap-4 pt-6">
          <button
            onClick={() =>
              navigate("/disciplines", { state: { suggestion, scores } })
            }
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:opacity-90 transition"
          >
            Go to Discipline Selection
          </button>
          <button
            onClick={() => navigate("/survey")}
            className="px-6 py-3 rounded-xl bg-white/80 backdrop-blur-xl border border-white/40 text-gray-700 font-semibold shadow hover:bg-white transition"
          >
            Retake Survey
          </button>
        </div>
      </main>
    </div>
  );
}
