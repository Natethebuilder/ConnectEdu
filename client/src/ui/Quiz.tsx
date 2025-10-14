import { useState } from "react";
import { useLearningProgress } from "../../hooks/useLearningProgress";

type Q = { q: string; choices: string[]; correct: number };
export default function Quiz({ stageId, questions }: { stageId: number; questions: Q[] }) {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const { row } = useLearningProgress as any; // using parent hook already manages stage_state

  const cur = questions[i];
  const done = i >= questions.length;

  function submit() {
    if (sel === cur.correct) setScore((s) => s + 1);
    setSel(null);
    setI((k) => k + 1);
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Quiz Complete</h4>
        <p className="text-gray-600 mb-4">Score: <span className="text-purple-700 font-semibold">{pct}%</span></p>
        <button className="px-3 py-2 rounded-xl bg-purple-600 text-white" onClick={() => { setI(0); setScore(0); }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-2">Quick Check</h4>
      <p className="mb-3 text-gray-700">{cur.q}</p>
      <div className="grid gap-2">
        {cur.choices.map((c, idx) => (
          <button
            key={idx}
            onClick={() => setSel(idx)}
            className={`text-left px-3 py-2 rounded-xl border bg-white hover:bg-purple-50 ${sel===idx ? "ring-2 ring-purple-300" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <button disabled={sel===null} onClick={submit} className="px-3 py-2 rounded-xl bg-purple-600 disabled:opacity-50 text-white">Submit</button>
      </div>
    </div>
  );
}
