// client/src/pages/learning/[discipline].tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import http from "../../api/http";

export default function LearningHubPage() {
  const { discipline } = useParams<{ discipline: string }>();
  const [hub, setHub] = useState<any>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["Global"]);
  const [activeStage, setActiveStage] = useState<any | null>(null);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<any>(null);

  // interactive reflections + quiz state
  const [reflectionText, setReflectionText] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  // get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // fetch learning hub
  useEffect(() => {
    if (!discipline) return;
    http.get(`/learning/${discipline}`).then((res) => setHub(res.data));
  }, [discipline]);

  // update progress
  const updateProgress = (stage: any) => {
    const total = Object.entries(stage.regions || {})
      .filter(([key]) => selectedRegions.includes(key))
      .reduce(
        (sum, [, region]: any) => sum + (region.checklist?.length || 0),
        0
      );
    const completed = Math.floor(total * 0.4);
    setProgress(total ? Math.min((completed / total) * 100, 100) : 0);
  };

  useEffect(() => {
    if (activeStage) updateProgress(activeStage);
  }, [activeStage, selectedRegions]);

  // Save reflection to Supabase (for persistence)
  async function saveReflection(
    userId: string,
    discipline: string,
    stageId: string,
    text: string
  ) {
    if (!userId || !text) return;
    await supabase.from("reflections").upsert({
      user_id: userId,
      discipline,
      stage_id: stageId,
      text,
    });
  }

  // simple dynamic quiz generator
  useEffect(() => {
    if (!activeStage) return;
    setQuizComplete(false);
    setQuizAnswers({});
    setScore(0);
    setQuizQuestions([
      {
        question: `Which of the following best represents the focus of "${activeStage.title}"?`,
        options: [
          "Deep research and application",
          "Setting goals and vision",
          "Interview techniques",
          "Extracurricular planning",
        ],
        correct: "Setting goals and vision",
      },
      {
        question: "Physics emphasizes which of these core skills?",
        options: ["Memory recall", "Mathematical reasoning", "Drawing", "Languages"],
        correct: "Mathematical reasoning",
      },
    ]);
  }, [activeStage]);

  // handle quiz answers
  function handleQuizAnswer(i: number, option: string) {
    const updated = { ...quizAnswers, [i]: option };
    setQuizAnswers(updated);

    if (Object.keys(updated).length === quizQuestions.length) {
      const correctCount = quizQuestions.filter(
        (q, idx) => updated[idx] === q.correct
      ).length;
      setScore(Math.round((correctCount / quizQuestions.length) * 100));
      setQuizComplete(true);
    }
  }

  if (!hub)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-lg text-gray-500 animate-pulse">
          Loading your personalized journey...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-[#FDF4FF] relative overflow-hidden">
      {/* floating background effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-3xl top-1/3 left-1/2 -translate-x-1/2"
        />
      </div>

      {/* header */}
      <header className="text-center py-16">
        <motion.h1
          className="text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {hub.discipline} Learning Journey
        </motion.h1>
        <motion.p
          className="mt-4 text-gray-600 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your personalized roadmap to mastery and admissions excellence.
        </motion.p>

        {/* region selector */}
        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          {Object.keys(hub.stages[0].regions).map((r) => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setSelectedRegions((prev) =>
                  prev.includes(r)
                    ? prev.filter((x) => x !== r)
                    : [...prev, r]
                )
              }
              className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all backdrop-blur-md ${
                selectedRegions.includes(r)
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                  : "bg-white/70 text-gray-700 hover:bg-white"
              }`}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </header>

      {/* stage cards */}
      <section className="flex justify-center flex-wrap gap-8 max-w-6xl mx-auto mb-20">
        {hub.stages.map((stage: any) => (
          <motion.div
            key={stage.id}
            onClick={() => setActiveStage(stage)}
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className={`cursor-pointer w-80 p-6 rounded-3xl border shadow-md bg-white/70 backdrop-blur-xl hover:shadow-2xl transition relative ${
              activeStage?.id === stage.id ? "ring-4 ring-purple-400" : ""
            }`}
          >
            <div className="text-5xl mb-4">{stage.icon || "🎯"}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {stage.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3">{stage.description}</p>
            <div className="flex items-center justify-between text-purple-600 font-semibold">
              Explore <ArrowRight size={18} />
            </div>
          </motion.div>
        ))}
      </section>

      {/* stage modal */}
      <AnimatePresence>
        {activeStage && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-2xl w-full max-w-3xl mx-4 rounded-3xl shadow-2xl relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 110, damping: 16 }}
            >
              <button
                onClick={() => setActiveStage(null)}
                className="absolute top-4 right-4 bg-white/70 rounded-full p-2 shadow hover:bg-white transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="p-8 max-h-[85vh] overflow-y-auto">
                <h2 className="text-3xl font-bold text-purple-700 mb-3">
                  {activeStage.title}
                </h2>
                <p className="text-gray-600 mb-6">{activeStage.description}</p>

                {/* progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <motion.div
                    className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.6 }}
                  />
                </div>

                {/* region sections */}
                {selectedRegions.map((regionKey) => {
                  const region = activeStage.regions[regionKey];
                  if (!region) return null;

                  return (
                    <div key={regionKey} className="mb-10">
                      <h3 className="font-semibold text-lg text-indigo-600 mb-2">
                        {regionKey} Focus
                      </h3>
                      <p className="text-gray-700 mb-4">{region.overview}</p>

                      {/* checklist */}
                      <h4 className="font-semibold text-md text-purple-600 mb-3">
                        Checklist
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {region.checklist.map((task: string, idx: number) => (
                          <motion.li
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border hover:shadow"
                          >
                            <CheckCircle
                              size={18}
                              className="text-green-500 flex-shrink-0"
                            />
                            <span className="text-gray-700">{task}</span>
                          </motion.li>
                        ))}
                      </ul>

                      {/* resources */}
                      <h4 className="font-semibold text-md text-purple-600 mb-3">
                        Resources
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4 mb-10">
                        {region.resources.map((r: any, idx: number) => (
                          <motion.a
                            key={idx}
                            href={r.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02 }}
                            className="block p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border shadow-sm hover:shadow-lg transition"
                          >
                            <h5 className="font-semibold text-purple-700">
                              {r.title}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {r.platform} · {r.type}
                            </p>
                          </motion.a>
                        ))}
                      </div>

                      {/* interactive dashboard */}
                      <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-inner mb-10">
                        <h4 className="font-semibold text-lg text-purple-700 mb-4">
                          Your Reflection
                        </h4>
                        <textarea
                          className="w-full h-28 p-3 border rounded-xl bg-white/60 focus:ring-2 focus:ring-purple-400 transition"
                          placeholder="What did you learn or achieve in this stage?"
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                          onBlur={() =>
                            saveReflection(
                              user?.id,
                              hub.discipline,
                              activeStage.id,
                              reflectionText
                            )
                          }
                        />
                      </div>

                      {/* quiz widget */}
                      <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 shadow-sm mb-10">
                        <h4 className="font-semibold text-lg text-purple-700 mb-3">
                          Quick Quiz
                        </h4>
                        <div className="space-y-3">
                          {quizQuestions.map((q, i) => (
                            <div key={i}>
                              <p className="font-medium text-gray-700 mb-2">
                                {q.question}
                              </p>
                              <div className="flex gap-3 flex-wrap">
                                {q.options.map((opt: string) => (
                                  <button
                                    key={opt}
                                    onClick={() => handleQuizAnswer(i, opt)}
                                    className={`px-4 py-2 rounded-full border text-sm ${
                                      quizAnswers[i] === opt
                                        ? "bg-purple-500 text-white"
                                        : "bg-white hover:bg-purple-50"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {quizComplete && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-green-600 font-semibold"
                          >
                            ✅ You scored {score}% — great job!
                          </motion.div>
                        )}
                      </div>

                      {/* explore projects */}
                      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 shadow-md mb-8">
                        <h4 className="font-semibold text-lg text-indigo-700 mb-4">
                          Explore Physics Projects
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Build hands-on experience with real-world experiments from trusted sources.
                        </p>
                        <motion.a
                          href="https://www.sciencebuddies.org/science-fair-projects/science-projects/physics"
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.03 }}
                          className="block text-center px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:shadow-lg"
                        >
                          Discover Physics Projects 🚀
                        </motion.a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
