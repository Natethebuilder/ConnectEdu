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
  Landmark,
  Brain,
  PenTool,
  Megaphone,
  Globe2,
  Building2,
  Stethoscope,
  HelpCircle,
} from "lucide-react";
import { disciplineExplanations } from "../utils/disciplineExplanations";

const icons: Record<string, any> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: BookOpen,
  "Computer Science": Cpu,
  Engineering: Wrench,
  Mathematics: Calculator,
  "Data Science": Database,
  "Economics & Business": Landmark,
  Psychology: Brain,
  Education: BookOpen,
  "Law & Political Science": Landmark,
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

  const suggestion = location.state?.suggestion as string | null;
  const scores = (location.state?.scores || {}) as Record<string, number>;

  // Sort all disciplines by score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3);

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
            profile, plus explanations for all options.
          </p>
        </div>

        {/* Recommendation Card */}
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/40 text-center"
          >
            {icons[suggestion] &&
              (() => {
                const Icon = icons[suggestion];
                return <Icon className="w-16 h-16 mx-auto mb-4 text-blue-600" />;
              })()}
            <h2 className="text-2xl font-bold text-gray-900">
              Recommended Discipline: {suggestion}
            </h2>
            <p className="text-gray-600 mt-2">
              This is our top match for you based on research-backed survey
              responses.
            </p>
          </motion.div>
        )}

        {/* Top 3 */}
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

        {/* Detailed Explanations */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Why These Recommendations?
          </h3>
          <div className="space-y-4">
            {sorted.map(([disc, score], i) => {
              const explanation = disciplineExplanations[disc];
              return (
                <motion.details
                  key={disc}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="group rounded-2xl bg-white/80 backdrop-blur-lg shadow-lg border border-white/40 overflow-hidden transition hover:shadow-xl"
                >
                  <summary className="cursor-pointer flex items-center justify-between px-5 py-4 select-none text-gray-900 font-medium">
                    <span>
                      {disc}{" "}
                      <span className="text-sm text-gray-500 ml-1">
                        (Score {score.toFixed(1)})
                      </span>
                    </span>
                    <motion.span
                      className="ml-3 text-gray-400 group-open:rotate-180 transition-transform"
                    >
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
              );
            })}
          </div>
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
