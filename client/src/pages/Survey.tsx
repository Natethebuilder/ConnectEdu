import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
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
  const [step, setStep] = useState(0);

  // Progress calculation
  const progress = Math.round(((step) / questions.length) * 100);
  const allAnswered = useMemo(
    () => questions.every((q) => answers[q.id] !== undefined),
    [answers]
  );

  function pickOption(qid: string, idx: number) {
    setAnswers((p) => ({ ...p, [qid]: idx }));
  }

  function next() {
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  }
  function back() {
    if (step > 0) setStep(step - 1);
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
    let suggestion: string | null = null;
    let max = -Infinity;
    Object.entries(scores).forEach(([disc, val]) => {
      if (val > max) {
        max = val;
        suggestion = disc;
      }
    });

    // 🎉 Confetti
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

    navigate("/survey-results", { state: { suggestion, scores } });
  }

  const q = questions[step];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Circular progress */}
      <div className="fixed top-1/4 right-8 z-50 flex flex-col items-center">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="gray"
            strokeWidth="6"
            fill="transparent"
            className="opacity-20"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="transparent"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>
        <p className="text-sm font-medium text-gray-700 mt-2">{progress}%</p>
      </div>

      {/* Question card */}
      <div className="relative z-10 w-full max-w-2xl p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/40"
          >
            <p className="text-sm text-gray-500 mb-2 text-center">
              Question {step + 1} of {questions.length}
            </p>
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              {q.text}
            </h2>
            {q.helper && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                {q.helper}
              </p>
            )}

            <div className="grid gap-3 mt-6">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <motion.button
                    key={oi}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => pickOption(q.id, oi)}
                    className={`px-5 py-3 rounded-xl font-medium transition-all shadow-sm
                      ${
                        selected
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                  >
                    {selected && <CheckCircle2 className="inline w-5 h-5 mr-2" />}
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={back}
                disabled={step === 0}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 disabled:opacity-40"
              >
                Back
              </button>
              {step === questions.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!allAnswered}
                  onClick={finishSurvey}
                  className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition
                    ${
                      allAnswered
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  <CheckCircle2 className="w-6 h-6" />
                  See my recommendation
                </motion.button>
              ) : (
                <button
                  onClick={next}
                  disabled={answers[q.id] === undefined}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-40"
                >
                  Next
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
