import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  FlaskConical,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Loader2,
  Sparkles,
  X,
  Droplets,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import http from "../../api/http";
import { saveQuizScore, saveReflection } from "../../hooks/useLearningProgress";

// utils
function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
const springy = { type: "spring", stiffness: 180, damping: 22 } as const;

// 3D molecular background (teal + lime lab glow)
function MolecularBG() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
        <color attach="background" args={["#001f1d"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} color="#5eead4" intensity={0.8} />
        <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
          <mesh>
            <sphereGeometry args={[1.6, 64, 64]} />
            <meshStandardMaterial color="#14b8a6" emissive="#0f766e" emissiveIntensity={0.35} transparent opacity={0.28} />
          </mesh>
        </Float>
        <Float speed={2.4} rotationIntensity={2}>
          <mesh position={[2.2, -1.3, 0]}>
            <sphereGeometry args={[0.9, 32, 32]} />
            <meshStandardMaterial color="#a7f3d0" emissive="#5eead4" emissiveIntensity={0.4} transparent opacity={0.22} />
          </mesh>
        </Float>
        <Float speed={1.6} rotationIntensity={1.5}>
          <mesh position={[-2.4, 1.2, -0.6]}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial color="#86efac" emissive="#84cc16" emissiveIntensity={0.35} transparent opacity={0.22} />
          </mesh>
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(20,184,166,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(132,204,22,.18),transparent)]" />
    </div>
  );
}

// --- Micro Simulations (Chemistry) ---
function ReactionRateSim() {
  const [temp, setTemp] = useState(25); // °C
  const [conc, setConc] = useState(0.5); // M
  // toy model: rate ~ k[A], with k increasing ~ 3% per °C above 25
  const rate = useMemo(() => conc * Math.pow(1.03, temp - 25), [temp, conc]);
  const normalized = Math.min(rate / 3, 1); // clamp visualisation
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
        <Droplets className="h-4 w-4 text-cyan-300" /> Reaction Rate
      </div>
      <div className="text-xs text-white/60 mb-3">Temp: {temp}°C · [A]: {conc.toFixed(2)} M</div>
      <div className="relative h-24 rounded-xl bg-white/5 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-lime-400"
          style={{ width: `${normalized * 100}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-xs text-white/70">Temp
          <input type="range" min={10} max={60} value={temp} onChange={(e) => setTemp(+e.target.value)} className="w-full" />
        </label>
        <label className="text-xs text-white/70">[A]
          <input type="range" min={0.1} max={1} step={0.05} value={conc} onChange={(e) => setConc(+e.target.value)} className="w-full" />
        </label>
      </div>
    </div>
  );
}

function MolecularVibrationSim() {
  const t = useMotionValue(0);
  const [amplitude, setAmplitude] = useState(10);
  useEffect(() => {
    let raf = 0;
    const loop = () => { t.set(t.get() + 0.016); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [t]);
  const y = useTransform(t, (time) => 30 + Math.sin(time * 4) * amplitude);
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
        <Sparkles className="h-4 w-4 text-lime-300" /> Molecular Vibration
      </div>
      <svg viewBox="0 0 100 60" className="w-full h-32">
        <motion.circle cx="35" cy={y} r="6" fill="#5eead4" />
        <motion.circle cx="65" cy={y} r="6" fill="#a3e635" />
        <motion.line x1="35" x2="65" y1={y.get()} y2={y.get()} stroke="white" strokeWidth="2" />
      </svg>
      <label className="text-xs text-white/70 block mt-2">Amplitude
        <input type="range" min={5} max={20} value={amplitude} onChange={(e) => setAmplitude(+e.target.value)} className="w-full" />
      </label>
    </div>
  );
}

// shared types + card
type Resource = { title: string; type: string; link: string; platform: string; estimatedHours?: number };
function ResourceCard({ r, bookmarked, onBookmark }: { r: Resource; bookmarked?: boolean; onBookmark?: () => void }) {
  return (
    <motion.a href={r.link} target="_blank" rel="noreferrer" whileHover={{ y: -4 }}
      className="group relative block rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-lime-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-1 flex items-center gap-2 text-xs text-white/70">
          <span className="px-2 py-0.5 rounded-full bg-white/10">{r.platform}</span>
          <span>•</span><span>{r.type}</span>
          {typeof r.estimatedHours === "number" && <span>• {r.estimatedHours}h</span>}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold text-white/90">{r.title}</h4>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-white/60" />
            <button type="button" onClick={(e) => { e.preventDefault(); onBookmark?.(); }}
              className="rounded-full bg-white/10 p-1 hover:bg-white/20">
              {bookmarked ? <BookmarkCheck className="h-4 w-4 text-emerald-300" /> : <Bookmark className="h-4 w-4 text-white/70" />}
            </button>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

// --- Main Chemistry Hub ---
export default function ChemistryLearningHub() {
  const { discipline = "chemistry" } = useParams();
  const [hub, setHub] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [region, setRegion] = useState<string>("Global");
  const [activeStage, setActiveStage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [stageState, setStageState] = useState<Record<string, any>>({});
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await http.get(`/learning/${discipline}`);
        if (!mounted) return;
        setHub(res.data);
        if (user?.id) {
          const { data } = await supabase
            .from("learning_progress")
            .select("stage_state, region, bookmarks")
            .eq("user_id", user.id)
            .eq("discipline", discipline)
            .maybeSingle();
          if (data) {
            setStageState(data.stage_state || {});
            setRegion(data.region || "Global");
            setBookmarks(data.bookmarks || []);
          }
        }
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, [discipline, user?.id]);

  const allRegions: string[] = useMemo(() => hub?.availableRegions || Object.keys(hub?.stages?.[0]?.regions || { Global: true }), [hub]);

  const overallProgress = useMemo(() => {
    if (!hub || !hub.stages) return 0;
    let total = 0, done = 0;
    for (const stage of hub.stages) {
      const regionData = stage.regions?.[region] || stage.regions?.Global;
      const list: string[] = regionData?.checklist || [];
      total += list.length;
      const checked = Object.keys(stageState?.[stage.id]?.checklist || {}).filter((k) => stageState[stage.id]?.checklist?.[k]).length;
      done += checked;
    }
    return total ? Math.round((done / total) * 100) : 0;
  }, [hub, stageState, region]);

  function persist(nextState = stageState, nextRegion = region, nextBookmarks = bookmarks) {
    if (!user?.id) return;
    supabase.from("learning_progress").upsert({
      user_id: user.id,
      discipline,
      stage_state: nextState,
      region: nextRegion,
      bookmarks: nextBookmarks,
    }).select();
  }

  function toggleTask(stageId: number, task: string) {
    setStageState((prev) => {
      const stage = { ...(prev[stageId] || {}), checklist: { ...(prev[stageId]?.checklist || {}) } };
      stage.checklist[task] = !stage.checklist[task];
      const next = { ...prev, [stageId]: stage };
      persist(next);
      return next;
    });
  }

  function isBookmarked(link: string) { return bookmarks?.some((b) => b.link === link); }
  function toggleBookmark(r: Resource) {
    const exists = bookmarks.some((b: any) => b.link === r.link);
    const next = exists ? bookmarks.filter((b: any) => b.link !== r.link) : [...bookmarks, r];
    setBookmarks(next); persist(stageState, region, next);
  }

  useEffect(() => {
    if (!activeStage) return;
    const q = activeStage.quiz || [
      { q: `In "${activeStage.title}", what matters most?`, opts: ["Experimental thinking", "Memorization", "Fashion", "Speed typing"], correct: "Experimental thinking" },
      { q: "A key chem skill is…", opts: ["Stoichiometry", "Mime", "Crosswords", "Origami"], correct: "Stoichiometry" },
    ];
    const allAnswered = Object.keys(quizAnswers).length >= q.length;
    if (allAnswered) {
      const score = q.reduce((acc: number, cur: any, i: number) => acc + (quizAnswers[i] === cur.correct ? 1 : 0), 0);
      const pct = Math.round((score / q.length) * 100);
      setQuizScore(pct);
      if (user?.id) saveQuizScore(user.id, discipline, activeStage.id, pct);
    } else { setQuizScore(null); }
  }, [quizAnswers, activeStage, user?.id, discipline]);

  if (loading || !hub) {
    return (
      <div className="relative min-h-screen">
        <MolecularBG />
        <div className="grid place-items-center min-h-screen">
          <div className="flex items-center gap-3 text-white/80">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading your Chemistry journey…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <MolecularBG />

      {/* Header */}
      <header className="relative mx-auto max-w-6xl px-6 pt-14 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={springy}>
          <div className="flex items-center justify-center gap-3 rounded-full bg-white/5 px-6 py-3 ring-1 ring-white/10 backdrop-blur mx-auto w-fit mb-6">
            <FlaskConical className="h-6 w-6 text-cyan-300" />
            <p className="font-semibold tracking-wide">Chemistry Learning Hub</p>
          </div>
          <h1 className="text-balance bg-gradient-to-br from-white to-cyan-200 bg-clip-text text-4xl sm:text-6xl font-extrabold text-transparent">
            The art of reactions, the science of life
          </h1>
          <p className="max-w-2xl mx-auto mt-3 text-white/80">
            A dynamic lab-like experience for aspiring chemists. Experiment, analyze, and create breakthroughs — right here.
          </p>

          {/* progress ring */}
          <div className="mt-6 relative grid place-items-center mx-auto w-fit">
            <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow">
              <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,.12)" strokeWidth="10" fill="none" />
              <motion.circle
                cx="60" cy="60" r="52" fill="none" strokeWidth="10"
                stroke="url(#chemgrad)" strokeLinecap="round"
                strokeDasharray={`${Math.PI * 2 * 52}`}
                strokeDashoffset={(1 - overallProgress / 100) * Math.PI * 2 * 52}
                initial={{ strokeDashoffset: Math.PI * 2 * 52 }}
                animate={{ strokeDashoffset: (1 - overallProgress / 100) * Math.PI * 2 * 52 }}
                transition={springy}
              />
              <defs>
                <linearGradient id="chemgrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#84cc16" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-xl font-bold">{overallProgress}%</div>
          </div>

          {/* Region chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {allRegions.map((r) => (
              <button key={r} onClick={() => { setRegion(r); persist(stageState, r, bookmarks); }}
                className={cx("rounded-full border border-white/15 px-4 py-1.5 text-sm backdrop-blur transition",
                  r === region ? "bg-white/15" : "bg-white/5 hover:bg-white/10")}>{r}</button>
            ))}
          </div>
        </motion.div>
      </header>

      {/* Stages timeline */}
      <main className="mx-auto mt-12 max-w-6xl px-6 pb-28">
        <ol className="relative border-l border-white/10">
          {hub.stages.map((stage: any, idx: number) => {
            const rData = stage.regions?.[region] || stage.regions?.Global;
            const list: string[] = rData?.checklist || [];
            const checked = Object.keys(stageState?.[stage.id]?.checklist || {}).filter((k) => stageState[stage.id]?.checklist?.[k]).length;
            const pct = list.length ? Math.round((checked / list.length) * 100) : 0;
            return (
              <li key={stage.id} className="ml-6 pb-10">
                <span className="absolute -left-[9px] mt-1 grid h-4 w-4 place-items-center rounded-full bg-cyan-400 ring-2 ring-cyan-300/50" />
                <motion.div whileHover={{ y: -2 }} className="rounded-2xl bg-white/5 p-5 backdrop-blur ring-1 ring-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold"><span className="mr-2 text-white/70">Stage {idx + 1}:</span>{stage.title}</h3>
                      <p className="mt-1 max-w-2xl text-sm text-white/70">{stage.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {pct}%
                      </div>
                      <button onClick={() => setActiveStage(stage)} className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-3 py-1 text-cyan-200 ring-1 ring-cyan-300/30 hover:bg-cyan-500/30">
                        Open <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>

        {/* Bookmarks gallery */}
        {bookmarks?.length > 0 && (
          <section className="mt-14">
            <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Bookmark className="h-5 w-5" /> Your bookmarks</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((r: Resource) => (
                <ResourceCard key={r.link} r={r} bookmarked onBookmark={() => toggleBookmark(r)} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Stage Modal */}
      <AnimatePresence>
        {activeStage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={springy}
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-2xl">
              <button onClick={() => setActiveStage(null)} className="absolute right-3 top-3 rounded-full bg-white/10 p-2 hover:bg-white/20"><X className="h-5 w-5" /></button>

              <div className="grid gap-6 p-6 sm:grid-cols-5">
                {/* Left: overview + checklist + resources + reflection */}
                <div className="sm:col-span-3">
                  <h3 className="text-2xl font-bold">{activeStage.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{activeStage.description}</p>

                  <div className="mt-5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-white/80">{(activeStage.regions?.[region] || activeStage.regions?.Global)?.overview}</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="mb-2 font-semibold text-cyan-200">Checklist</h4>
                    <ul className="space-y-2">
                      {(activeStage.regions?.[region] || activeStage.regions?.Global)?.checklist?.map((task: string) => (
                        <li key={task} className="flex items-start gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                          <button onClick={() => toggleTask(activeStage.id, task)}
                            className={cx("mt-0.5 grid h-5 w-5 place-items-center rounded-full border",
                              stageState?.[activeStage.id]?.checklist?.[task] ? "border-emerald-400 bg-emerald-400/20" : "border-white/30")}>
                            {stageState?.[activeStage.id]?.checklist?.[task] && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />}
                          </button>
                          <span className="text-sm text-white/85">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <h4 className="mb-2 font-semibold text-cyan-200">Curated resources</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(activeStage.regions?.[region] || activeStage.regions?.Global)?.resources?.map((r: Resource) => (
                        <ResourceCard key={r.link} r={r} bookmarked={isBookmarked(r.link)} onBookmark={() => toggleBookmark(r)} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <h4 className="mb-2 font-semibold text-cyan-200">Reflection</h4>
                    <textarea
                      className="min-h-[96px] w-full rounded-xl bg-white/5 p-3 text-sm outline-none ring-1 ring-inset ring-white/10 placeholder:text-white/50"
                      placeholder="What reactions, analyses, or insights did you explore?"
                      defaultValue={stageState?.[activeStage.id]?.notes || ""}
                      onBlur={(e) => {
                        const val = e.currentTarget.value;
                        const next = { ...stageState, [activeStage.id]: { ...(stageState[activeStage.id] || {}), notes: val } };
                        setStageState(next); persist(next);
                        if (user?.id) saveReflection(user.id, discipline, activeStage.id, val);
                      }}
                    />
                  </div>
                </div>

                {/* Right: sims + quiz + ideas */}
                <div className="sm:col-span-2 flex flex-col gap-4">
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="mb-2 flex items-center gap-2 text-sm text-white/80"><Sparkles className="h-4 w-4 text-cyan-300" /> Chem Playground</div>
                    <div className="grid gap-3">
                      <ReactionRateSim />
                      <MolecularVibrationSim />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="mb-2 flex items-center gap-2 text-sm text-white/80"><GraduationCap className="h-4 w-4 text-cyan-300" /> Quick quiz</div>
                    <div className="space-y-3">
                      {(activeStage.quiz || [
                        { q: `In "${activeStage.title}" what matters most?`, opts: ["Experimental thinking", "Memorization", "Graphic design", "Speed typing"], correct: "Experimental thinking" },
                        { q: "A key chem skill is…", opts: ["Stoichiometry", "Mime", "Crosswords", "Origami"], correct: "Stoichiometry" },
                      ]).map((Q: any, i: number) => (
                        <div key={i}>
                          <p className="text-sm text-white/85">{Q.q}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {Q.opts.map((opt: string) => (
                              <button key={opt} onClick={() => setQuizAnswers((prev) => ({ ...prev, [i]: opt }))}
                                className={cx("rounded-full border border-white/15 px-3 py-1 text-sm",
                                  quizAnswers[i] === opt ? "bg-cyan-500/30" : "bg-white/5 hover:bg-white/10")}>{opt}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {quizScore !== null && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-emerald-300">✅ You scored {quizScore}%</motion.div>
                    )}
                  </div>

                  {(activeStage.regions?.Global?.projectIdeas?.length > 0) && (
                    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="mb-2 flex items-center gap-2 text-sm text-white/80"><Droplets className="h-4 w-4 text-lime-300" /> Experiment ideas</div>
                      <div className="flex snap-x snap-mandatory overflow-x-auto gap-3 pb-2">
                        {activeStage.regions.Global.projectIdeas.map((idea: string, i: number) => (
                          <motion.div key={i} whileHover={{ y: -2 }} className="snap-start min-w-[280px] rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                            <div className="mb-2 flex items-center gap-2 text-xs text-white/70"><Sparkles className="h-4 w-4 text-yellow-200" /> Idea</div>
                            <p className="text-white/85">{idea}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-10 text-center text-xs text-white/50">Made for future scientists ⚗️</footer>
    </div>
  );
}
