import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Beaker,
  FlaskConical,
  Cpu,
  Atom,
  Brush,
  Users,
  Landmark,
  Briefcase,
  Stethoscope,
  Globe2,
  Database,
  Calculator,
  BookOpen,
  Leaf,
  CheckCircle2,
} from "lucide-react";

// ------------------------------------------------------------------
// Research-backed structure:
// - Mix of Interests (RIASEC-style), Self-efficacy, Work-style, Values.
// - Each option contributes weighted points to one or more disciplines.
// - We compute totals and send top suggestion to DisciplineSelect.
// ------------------------------------------------------------------

type Option = {
  label: string;
  weights: Record<string, number>; // discipline -> points
};

type Question = {
  id: string;
  text: string;
  helper?: string;
  options: Option[];
};

const D = {
  Physics: "Physics",
  Chemistry: "Chemistry",
  Biology: "Biology",
  "Computer Science": "Computer Science",
  Engineering: "Engineering",
  Mathematics: "Mathematics",
  "Data Science": "Data Science",
  "Economics & Business": "Economics & Business",
  Psychology: "Psychology",
  Education: "Education",
  "Law & Political Science": "Law & Political Science",
  "Art & Design": "Art & Design",
  "Communications & Media": "Communications & Media",
  "Environmental Science": "Environmental Science",
  Architecture: "Architecture",
  "Medicine & Healthcare": "Medicine & Healthcare",
  "History & Literature": "History & Literature",
};

const LIKERT = (low: number, high: number, weights: Record<string, number>[]) =>
  [1, 2, 3, 4, 5].map((v, i) => ({
    label:
      ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"][i],
    weights: Object.fromEntries(
      Object.entries(weights[Math.min(i, weights.length - 1)] || {}).map(
        ([k, w]) => [k, w]
      )
    ),
  }));

const questions: Question[] = [
  {
    id: "q1",
    text: "I enjoy figuring out how the world works through experiments and research.",
    helper: "Investigative (RIASEC) — science/analysis curiosity",
    options: LIKERT(1, 5, [
      {}, // SD
      { [D["History & Literature"]]: 0.5 },
      { [D.Biology]: 0.5 },
      { [D.Biology]: 1, [D.Chemistry]: 1, [D.Physics]: 1 },
      { [D.Engineering]: 1, [D["Data Science"]]: 1, [D["Computer Science"]]: 0.5 },
    ]),
  },
  {
    id: "q2",
    text: "I like creating or performing — writing, visual design, music, or film.",
    helper: "Artistic (RIASEC) — creativity/openness",
    options: LIKERT(1, 5, [
      {},
      {},
      { [D["Communications & Media"]]: 0.5 },
      { [D["Art & Design"]]: 1, [D["Communications & Media"]]: 0.5 },
      { [D["Art & Design"]]: 1.5, [D["Communications & Media"]]: 1 },
    ]),
  },
  {
    id: "q3",
    text: "I get energy from helping or teaching others.",
    helper: "Social (RIASEC) — helping/teaching",
    options: LIKERT(1, 5, [
      {},
      {},
      { [D.Psychology]: 0.5 },
      { [D.Education]: 1, [D.Psychology]: 1 },
      { [D.Education]: 1.5, [D.Psychology]: 1, [D["Medicine & Healthcare"]]: 0.5 },
    ]),
  },
  {
    id: "q4",
    text: "I enjoy leading teams and persuading others toward a goal.",
    helper: "Enterprising (RIASEC) — leadership/persuasion",
    options: LIKERT(1, 5, [
      {},
      {},
      { [D["Law & Political Science"]]: 0.5 },
      { [D["Economics & Business"]]: 1, [D["Law & Political Science"]]: 1 },
      { [D["Economics & Business"]]: 1.5, [D["Law & Political Science"]]: 1 },
    ]),
  },
  {
    id: "q5",
    text: "I prefer hands-on tasks like building, fixing, or prototyping.",
    helper: "Realistic (RIASEC) — hands-on/building",
    options: LIKERT(1, 5, [
      {},
      {},
      { [D.Architecture]: 0.5 },
      { [D.Engineering]: 1, [D.Architecture]: 1 },
      { [D.Engineering]: 1.5, [D.Architecture]: 1, [D["Computer Science"]]: 0.5 },
    ]),
  },
  {
    id: "q6",
    text: "Rate your confidence in advanced math.",
    helper: "Self-efficacy — math confidence predicts STEM persistence",
    options: [
      { label: "Low", weights: {} },
      {
        label: "Okay",
        weights: { [D.Mathematics]: 0.5, [D.Physics]: 0.5, [D["Data Science"]]: 0.5 },
      },
      {
        label: "Good",
        weights: {
          [D.Mathematics]: 1,
          [D.Physics]: 0.8,
          [D["Data Science"]]: 1,
          [D.Engineering]: 0.5,
        },
      },
      {
        label: "Very good",
        weights: {
          [D.Mathematics]: 1.5,
          [D.Physics]: 1.2,
          [D["Data Science"]]: 1.2,
          [D.Engineering]: 1,
        },
      },
      {
        label: "Excellent",
        weights: {
          [D.Mathematics]: 2,
          [D.Physics]: 1.5,
          [D["Data Science"]]: 1.5,
          [D.Engineering]: 1.2,
          [D["Computer Science"]]: 0.8,
        },
      },
    ],
  },
  {
    id: "q7",
    text: "Rate your confidence in writing & communication.",
    helper: "Self-efficacy — verbal/writing",
    options: [
      { label: "Low", weights: {} },
      {
        label: "Okay",
        weights: { [D["History & Literature"]]: 0.5, [D["Communications & Media"]]: 0.5 },
      },
      {
        label: "Good",
        weights: {
          [D["History & Literature"]]: 1,
          [D["Communications & Media"]]: 1,
          [D["Law & Political Science"]]: 0.5,
        },
      },
      {
        label: "Very good",
        weights: {
          [D["History & Literature"]]: 1.2,
          [D["Communications & Media"]]: 1.2,
          [D["Law & Political Science"]]: 1,
          [D.Education]: 0.5,
        },
      },
      {
        label: "Excellent",
        weights: {
          [D["History & Literature"]]: 1.5,
          [D["Communications & Media"]]: 1.5,
          [D["Law & Political Science"]]: 1.2,
          [D.Education]: 0.8,
        },
      },
    ],
  },
  {
    id: "q8",
    text: "Rate your confidence in lab sciences (biology/chemistry).",
    helper: "Self-efficacy — lab / experimental",
    options: [
      { label: "Low", weights: {} },
      {
        label: "Okay",
        weights: { [D.Biology]: 0.5, [D.Chemistry]: 0.5 },
      },
      {
        label: "Good",
        weights: { [D.Biology]: 1, [D.Chemistry]: 1, [D["Medicine & Healthcare"]]: 0.5 },
      },
      {
        label: "Very good",
        weights: { [D.Biology]: 1.2, [D.Chemistry]: 1.2, [D["Medicine & Healthcare"]]: 1 },
      },
      {
        label: "Excellent",
        weights: {
          [D.Biology]: 1.5,
          [D.Chemistry]: 1.5,
          [D["Medicine & Healthcare"]]: 1.2,
          [D["Environmental Science"]]: 0.8,
        },
      },
    ],
  },
  {
    id: "q9",
    text: "I prefer working mostly in teams rather than solo.",
    helper: "Work-style — collaboration vs. individual",
    options: LIKERT(1, 5, [
      { [D["Computer Science"]]: 0.5, [D["Data Science"]]: 0.5 },
      { [D.Physics]: 0.3, [D.Mathematics]: 0.3 },
      { [D.Engineering]: 0.5, [D["Communications & Media"]]: 0.5 },
      { [D["Economics & Business"]]: 1, [D.Education]: 1 },
      { [D["Economics & Business"]]: 1.2, [D.Education]: 1, [D["Law & Political Science"]]: 0.8 },
    ]),
  },
  {
    id: "q10",
    text: "I’m detail-oriented and enjoy organizing data and systems.",
    helper: "Work-style — conscientiousness/structure",
    options: LIKERT(1, 5, [
      {},
      {},
      { [D["Data Science"]]: 0.5, [D["Computer Science"]]: 0.5 },
      { [D["Data Science"]]: 1, [D["Computer Science"]]: 1, [D["Economics & Business"]]: 0.5 },
      { [D["Data Science"]]: 1.5, [D["Computer Science"]]: 1.2, [D.Mathematics]: 1 },
    ]),
  },
  {
    id: "q11",
    text: "When I think about my future career, **high pay and job security** are very important to me.",
    helper: "Values — extrinsic motivation",
    options: LIKERT(1, 5, [
      {},
      {},
      { [D["Economics & Business"]]: 0.5 },
      { [D.Engineering]: 1, [D["Computer Science"]]: 1, [D["Economics & Business"]]: 1 },
      {
        [D.Engineering]: 1.2,
        [D["Computer Science"]]: 1.2,
        [D["Economics & Business"]]: 1.2,
        [D["Data Science"]]: 1,
      },
    ]),
  },
  {
    id: "q12",
    text: "Making a **positive impact** (health, community, environment) matters a lot to me.",
    helper: "Values — prosocial/impact",
    options: LIKERT(1, 5, [
      {},
      {},
      { [D.Psychology]: 0.5, [D["Environmental Science"]]: 0.5 },
      { [D.Education]: 1, [D["Medicine & Healthcare"]]: 1 },
      {
        [D.Education]: 1,
        [D["Medicine & Healthcare"]]: 1.2,
        [D["Environmental Science"]]: 1,
        [D.Psychology]: 0.8,
      },
    ]),
  },
];

export default function Survey() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Nice: persist progress in case they navigate away accidentally
  useEffect(() => {
    const saved = localStorage.getItem("surveyAnswers:v1");
    if (saved) setAnswers(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("surveyAnswers:v1", JSON.stringify(answers));
  }, [answers]);

  const allAnswered = useMemo(
    () => questions.every((q) => answers[q.id] !== undefined),
    [answers]
  );
  const progress = Math.round(
    (Object.keys(answers).length / questions.length) * 100
  );

  function pickOption(qid: string, idx: number) {
    setAnswers((p) => ({ ...p, [qid]: idx }));
    setTouched((p) => ({ ...p, [qid]: true }));
  }

  function finishSurvey() {
    const scores: Record<string, number> = {};
    for (const q of questions) {
      const idx = answers[q.id];
      if (idx === undefined) continue;
      const opt = q.options[idx];
      Object.entries(opt.weights).forEach(([disc, pts]) => {
        scores[disc] = (scores[disc] || 0) + pts;
      });
    }
    // Top suggestion
    let suggestion: string | null = null;
    let max = -Infinity;
    Object.entries(scores).forEach(([disc, val]) => {
      if (val > max) {
        max = val;
        suggestion = disc;
      }
    });

    navigate("/survey-results", { state: { suggestion, scores } });

  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Animated blobs */}
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-10 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      <main className="relative z-10 max-w-3xl w-full mx-auto p-6 md:p-10">
        {/* Header + progress */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Find your best-fit discipline
          </h1>
          <p className="text-center text-gray-600 mt-1">
            Answer honestly — there are no right or wrong answers.
          </p>

          <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-right">{progress}%</p>
        </motion.div>

        <div className="space-y-6">
          {questions.map((q, qi) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.03 }}
              className="p-5 rounded-2xl bg-white/70 backdrop-blur-xl shadow-lg border border-white/40"
            >
              <p className="font-semibold text-gray-900">{q.text}</p>
              {q.helper && (
                <p className="text-xs text-gray-500 mt-1">{q.helper}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {q.options.map((opt, oi) => {
                  const selected = answers[q.id] === oi;
                  return (
                    <button
                      key={oi}
                      onClick={() => pickOption(q.id, oi)}
                      className={`px-4 py-2 rounded-lg border text-left transition
                        ${
                          selected
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow"
                            : "bg-gray-100 hover:bg-gray-200 border-gray-200"
                        }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Inline nudge to improve completion clarity */}
              {!touched[q.id] && (
                <div className="mt-3 text-xs text-gray-500">
                  Tip: Pick the option that feels most true for you.
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center mt-8">
          <button
            disabled={!allAnswered}
            onClick={finishSurvey}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 ${
              allAnswered
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:opacity-90 transition"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            See my recommendation
          </button>
          <p className="text-xs text-gray-500 mt-2">
            We’ll show a recommendation and highlight it on the next screen. You still decide.
          </p>
        </div>
      </main>
    </div>
  );
}
