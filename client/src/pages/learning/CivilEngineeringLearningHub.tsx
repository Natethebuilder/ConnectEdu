import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Loader2,
  Sparkles,
  X,
  Wrench,
  Gauge,
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

// 3D infrastructure/construction background (teal + cyan civil engineering theme)
function CivilBG() {
  return (
    <div className="absolute inset-0 -z-10">
      <Suspense fallback={<div className="absolute inset-0 bg-[#0a1418]" />}>
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
          <color attach="background" args={["#0a1418"]} />
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} color="#14b8a6" intensity={1.1} />
          <pointLight position={[-5, -3, 3]} color="#06b6d4" intensity={0.9} />
          <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
            <mesh>
              <boxGeometry args={[1.2, 1.2, 1.2]} />
              <meshStandardMaterial color="#14b8a6" emissive="#0d9488" emissiveIntensity={0.6} transparent opacity={0.35} />
            </mesh>
          </Float>
          <Float speed={2.4} rotationIntensity={2}>
            <mesh position={[2.2, -1.3, 0]}>
              <boxGeometry args={[0.9, 0.9, 0.9]} />
              <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.6} transparent opacity={0.3} />
            </mesh>
          </Float>
          <Float speed={1.6} rotationIntensity={1.5}>
            <mesh position={[-2.4, 1.2, -0.6]}>
              <boxGeometry args={[0.7, 0.7, 0.7]} />
              <meshStandardMaterial color="#2dd4bf" emissive="#14b8a6" emissiveIntensity={0.55} transparent opacity={0.28} />
            </mesh>
          </Float>
          <Float speed={1.8} rotationIntensity={1.8}>
            <mesh position={[0, 2, -1]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={0.5} transparent opacity={0.26} />
            </mesh>
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
        </Canvas>
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(20,184,166,.3),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(6,182,212,.25),transparent),radial-gradient(40%_40%_at_20%_20%,rgba(45,212,191,.2),transparent)]" />
    </div>
  );
}

// --- Micro Simulations (CE) ---
function TrussAnalysisSim() {
  const [load, setLoad] = useState(50);
  const [span, setSpan] = useState(10);
  const reaction = load / 2;
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
        <Wrench className="h-4 w-4 text-teal-300" /> Truss Analysis
      </div>
      <div className="text-xs text-white/60 mb-3">Load = {load}kN · Span = {span}m → Reaction = {reaction.toFixed(1)}kN</div>
      <svg viewBox="0 0 100 50" className="w-full h-32">
        {/* Simple truss structure */}
        <line x1="10" y1="30" x2="50" y2="10" stroke="#14b8a6" strokeWidth="2" />
        <line x1="50" y1="10" x2="90" y2="30" stroke="#14b8a6" strokeWidth="2" />
        <line x1="10" y1="30" x2="90" y2="30" stroke="#06b6d4" strokeWidth="2" />
        <line x1="50" y1="10" x2="50" y2="30" stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="2,2" />
        {/* Supports */}
        <circle cx="10" cy="30" r="3" fill="#14b8a6" />
        <circle cx="90" cy="30" r="3" fill="#14b8a6" />
        {/* Load arrow */}
        <motion.path
          d={`M 50 10 L 50 ${10 + (load / 10)}`}
          stroke="#fbbf24"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#fbbf24" />
          </marker>
        </defs>
        <text x="50" y="45" fontSize="8" fill="rgba(255,255,255,.6)" textAnchor="middle">R = {reaction.toFixed(1)}kN each</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-xs text-white/70">Load (kN)
          <input type="range" min={10} max={100} value={load} onChange={(e) => setLoad(+e.target.value)} className="w-full" />
        </label>
        <label className="text-xs text-white/70">Span (m)
          <input type="range" min={5} max={20} value={span} onChange={(e) => setSpan(+e.target.value)} className="w-full" />
        </label>
      </div>
    </div>
  );
}

function StressStrainSim() {
  const [stress, setStress] = useState(50);
  const [strain, setStrain] = useState(0.001);
  const modulus = strain > 0 ? stress / strain : 0;
  const points = useMemo(() => {
    const pts: [number, number][] = [];
    for (let x = 0; x <= 100; x += 2) {
      const s = (x / 100) * stress;
      const e = (x / 100) * strain;
      const y = 50 - (e * 50000);
      pts.push([x, Math.max(0, Math.min(50, y))]);
    }
    return pts;
  }, [stress, strain]);
  const d = points.length > 0 ? `M ${points.map((p) => p.join(",")).join(" L ")}` : "";
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
        <Gauge className="h-4 w-4 text-cyan-300" /> Stress-Strain
      </div>
      <div className="text-xs text-white/60 mb-3">E = {modulus > 0 ? modulus.toFixed(0) : "0"}MPa</div>
      <svg viewBox="0 0 100 50" className="w-full h-32">
        {d && <path d={d} fill="none" stroke="#14b8a6" strokeWidth="2" />}
        <line x1="0" x2="100" y1="50" y2="50" stroke="rgba(255,255,255,.2)" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="50" stroke="rgba(255,255,255,.2)" strokeWidth="1" />
        <text x="50" y="45" fontSize="8" fill="rgba(255,255,255,.6)" textAnchor="middle">σ = {stress}MPa, ε = {(strain * 1000).toFixed(2)}‰</text>
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-xs text-white/70">Stress (MPa)
          <input type="range" min={10} max={200} value={stress} onChange={(e) => setStress(+e.target.value)} className="w-full" />
        </label>
        <label className="text-xs text-white/70">Strain (×10⁻³)
          <input type="range" min={1} max={10} step={0.1} value={strain * 1000} onChange={(e) => setStrain(Math.max(0.0001, +e.target.value / 1000))} className="w-full" />
        </label>
      </div>
    </div>
  );
}

// shared types + card
type Resource = { title: string; type: string; link: string; platform: string; estimatedHours?: number };
function ResourceCard({ r, bookmarked, onBookmark }: { r: Resource; bookmarked?: boolean; onBookmark?: () => void }) {
  return (
    <motion.a href={r.link} target="_blank" rel="noreferrer" whileHover={{ y: -4 }}
      className="group relative block rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
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

// --- Main CE Hub ---
export default function CivilEngineeringLearningHub() {
  const { discipline = "civil-engineering" } = useParams();
  const [hub, setHub] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [region, setRegion] = useState<string>("Global");
  const [activeStage, setActiveStage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  // store progress for ALL regions (not just the current one)
  const [stageState, setStageState] = useState<Record<string, Record<string, any>>>({});
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // 1️⃣ Wait for the user
        const { data: userData } = await supabase.auth.getUser();
        const currentUser = userData?.user;
        if (!currentUser || !mounted) return;
        setUser(currentUser);

        // 2️⃣ Load hub JSON
        const res = await http.get(`/learning/${discipline}`);
        if (!mounted) return;
        setHub(res.data);

        // 3️⃣ Load user progress
        const { data: progress } = await supabase
          .from("learning_progress")
          .select("stage_state, region, bookmarks")
          .eq("user_id", currentUser.id)
          .eq("discipline", discipline)
          .maybeSingle();

        if (progress) {
          setStageState(progress.stage_state || {});
          setRegion(progress.region || "Global");
          setBookmarks(progress.bookmarks || []);
        } else {
          setStageState({});
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading civil engineering hub:", error);
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [discipline]);

  const allRegions: string[] = useMemo(() => hub?.availableRegions || Object.keys(hub?.stages?.[0]?.regions || { Global: true }), [hub]);

  const overallProgress = useMemo(() => {
    if (!hub || !hub.stages) return 0;
    const currentRegionState = stageState[region] || {};
    let total = 0; let done = 0;
    for (const stage of hub.stages) {
      const regionData = stage.regions?.[region] || stage.regions?.Global;
      const list: string[] = regionData?.checklist || [];
      total += list.length;
      const checked = Object.keys(currentRegionState?.[stage.id]?.checklist || {}).filter(
        (k) => currentRegionState?.[stage.id]?.checklist?.[k]
      ).length;
      done += checked;
    }
    return total ? Math.round((done / total) * 100) : 0;
  }, [hub, stageState, region]);

  async function persist(
    updatedStageState: Record<string, Record<string, any>> = stageState,
    currentRegion = region,
    currentBookmarks = bookmarks
  ) {
    if (!user?.id) return;

    const { data: existing } = await supabase
      .from("learning_progress")
      .select("stage_state")
      .eq("user_id", user.id)
      .eq("discipline", discipline)
      .maybeSingle();

    const serverState = existing?.stage_state || {};

    // merge: keep all regions from server, patch just the current one from local state
    // This ensures we never lose data from other regions, even if updatedStageState is incomplete
    const merged = {
      ...serverState,
      [currentRegion]: {
        ...(serverState[currentRegion] || {}),
        ...(updatedStageState[currentRegion] || {}),
      },
    };

    await supabase
      .from("learning_progress")
      .upsert(
        {
          user_id: user.id,
          discipline,
          region: currentRegion,     // preferred region
          stage_state: merged,       // the merged full map of all regions
          bookmarks: currentBookmarks
        },
        { onConflict: "user_id,discipline" }
      )
      .select();

    setStageState(merged);
  }

  function toggleTask(stageId: number, task: string) {
    setStageState((prev) => {
      const regionState = { ...(prev[region] || {}) };
      const currentStage = {
        ...(regionState[stageId] || {}),
        checklist: { ...(regionState[stageId]?.checklist || {}) },
      };

      // Toggle task
      currentStage.checklist[task] = !currentStage.checklist[task];

      const updatedRegionState = { ...regionState, [stageId]: currentStage };
      const next = { ...prev, [region]: updatedRegionState };

      // Save the updated all-region state
      persist(next, region);
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
      { q: `In "${activeStage.title}", what matters most?`, opts: ["Structural analysis & design", "Memorization", "Fashion", "Speed typing"], correct: "Structural analysis & design" },
      { q: "A key CE skill is…", opts: ["Infrastructure design & problem-solving", "Mime", "Crosswords", "Origami"], correct: "Infrastructure design & problem-solving" },
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
        <CivilBG />
        <div className="grid place-items-center min-h-screen">
          <div className="flex items-center gap-3 text-white/80">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading your Civil Engineering journey…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <CivilBG />

      {/* Header */}
      <header className="relative mx-auto max-w-6xl px-6 pt-14 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={springy}>
          <div className="flex items-center justify-center gap-3 rounded-full bg-white/5 px-6 py-3 ring-1 ring-white/10 backdrop-blur mx-auto w-fit mb-6">
            <Building2 className="h-6 w-6 text-teal-300" />
            <p className="font-semibold tracking-wide">Civil Engineering Learning Hub</p>
          </div>
          <h1 className="text-balance bg-gradient-to-br from-white to-teal-200 bg-clip-text text-4xl sm:text-6xl font-extrabold text-transparent">
            Build the future, one structure at a time
          </h1>
          <p className="max-w-2xl mx-auto mt-3 text-white/80">
            A comprehensive engineering journey for aspiring civil engineers. Design infrastructure, analyze systems, and create lasting impact — right here.
          </p>

          {/* progress ring */}
          <div className="mt-6 relative grid place-items-center mx-auto w-fit">
            <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow">
              <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,.12)" strokeWidth="10" fill="none" />
              <motion.circle
                cx="60" cy="60" r="52" fill="none" strokeWidth="10"
                stroke="url(#cegrad)" strokeLinecap="round"
                strokeDasharray={`${Math.PI * 2 * 52}`}
                strokeDashoffset={(1 - overallProgress / 100) * Math.PI * 2 * 52}
                initial={{ strokeDashoffset: Math.PI * 2 * 52 }}
                animate={{ strokeDashoffset: (1 - overallProgress / 100) * Math.PI * 2 * 52 }}
                transition={springy}
              />
              <defs>
                <linearGradient id="cegrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-xl font-bold">{overallProgress}%</div>
          </div>

          {/* Region chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {allRegions.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRegion(r);
                  persist(stageState, r); // stores preferred region; keeps all checklists
                }}
                className={cx(
                  "rounded-full border border-white/15 px-4 py-1.5 text-sm backdrop-blur transition",
                  r === region ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
                )}
              >
                {r}
              </button>
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
            const regionState = stageState?.[region] || {};
            const checked = Object.keys(regionState?.[stage.id]?.checklist || {}).filter(
              (k) => regionState?.[stage.id]?.checklist?.[k]
            ).length;
            const pct = list.length ? Math.round((checked / list.length) * 100) : 0;
            return (
              <li key={stage.id} className="ml-6 pb-10">
                <span className="absolute -left-[9px] mt-1 grid h-4 w-4 place-items-center rounded-full bg-teal-400 ring-2 ring-teal-300/50" />
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
                      <button onClick={() => setActiveStage(stage)} className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-3 py-1 text-teal-200 ring-1 ring-teal-300/30 hover:bg-teal-500/30">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={springy}
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl 
                         border border-white/20 bg-white/10 backdrop-blur-2xl 
                         shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-white/90 leading-relaxed"
            >
              <button
                onClick={() => setActiveStage(null)}
                className="absolute right-3 top-3 rounded-full bg-white/15 p-2 hover:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid gap-6 p-6 sm:grid-cols-5">
                {/* Left: overview + checklist + resources + reflection */}
                <div className="sm:col-span-3 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                      {activeStage.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                      {activeStage.description}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/35 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <p className="text-sm text-white/90 leading-relaxed">
                      {(activeStage.regions?.[region] || activeStage.regions?.Global)?.overview}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <h4 className="mb-3 font-semibold text-teal-200">Checklist</h4>
                    <ul className="space-y-2">
                      {(activeStage.regions?.[region] || activeStage.regions?.Global)?.checklist?.map((task: string) => (
                        <li
                          key={task}
                          className="flex items-start gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 hover:bg-white/10 transition"
                        >
                          <button
                            onClick={() => toggleTask(activeStage.id, task)}
                            className={cx(
                              "mt-0.5 grid h-5 w-5 place-items-center rounded-full border",
                              stageState?.[region]?.[activeStage.id]?.checklist?.[task]
                                ? "border-emerald-400 bg-emerald-400/20"
                                : "border-white/30"
                            )}
                          >
                            {stageState?.[region]?.[activeStage.id]?.checklist?.[task] && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                            )}
                          </button>
                          <span className="text-sm text-white/90">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <h4 className="mb-3 font-semibold text-teal-200">Curated resources</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(activeStage.regions?.[region] || activeStage.regions?.Global)?.resources?.map((r: Resource) => (
                        <ResourceCard key={r.link} r={r} bookmarked={isBookmarked(r.link)} onBookmark={() => toggleBookmark(r)} />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <h4 className="mb-3 font-semibold text-teal-200">Reflection</h4>
                    <textarea
                      className="min-h-[96px] w-full rounded-xl bg-white/5 p-3 text-sm outline-none ring-1 ring-inset ring-white/10 placeholder:text-white/50 text-white/90"
                      placeholder="What structures, systems, or insights did you explore?"
                      defaultValue={stageState?.[region]?.[activeStage.id]?.notes || ""}
                      onBlur={(e) => {
                        const val = e.currentTarget.value;
                        setStageState((prev) => {
                          const regionState = { ...(prev[region] || {}) };
                          const nextStage = { ...(regionState[activeStage.id] || {}), notes: val };
                          const next = { ...prev, [region]: { ...regionState, [activeStage.id]: nextStage } };
                          persist(next, region);
                          return next;
                        });
                        if (user?.id) saveReflection(user.id, discipline, activeStage.id, val);
                      }}
                    />
                  </div>
                </div>

                {/* Right: sims + quiz + ideas */}
                <div className="sm:col-span-2 flex flex-col gap-4">
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="mb-2 flex items-center gap-2 text-sm text-white/80"><Sparkles className="h-4 w-4 text-teal-300" /> Structural Playground</div>
                    <div className="grid gap-3">
                      <TrussAnalysisSim />
                      <StressStrainSim />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="mb-2 flex items-center gap-2 text-sm text-white/80"><GraduationCap className="h-4 w-4 text-teal-300" /> Quick quiz</div>
                    <div className="space-y-3">
                      {(activeStage.quiz || [
                        { q: `In "${activeStage.title}" what matters most?`, opts: ["Structural analysis & design", "Memorization", "Graphic design", "Speed typing"], correct: "Structural analysis & design" },
                        { q: "A key CE skill is…", opts: ["Infrastructure design & problem-solving", "Mime", "Crosswords", "Origami"], correct: "Infrastructure design & problem-solving" },
                      ]).map((Q: any, i: number) => (
                        <div key={i}>
                          <p className="text-sm text-white/85">{Q.q}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {Q.opts.map((opt: string) => (
                              <button key={opt} onClick={() => setQuizAnswers((prev) => ({ ...prev, [i]: opt }))}
                                className={cx("rounded-full border border-white/15 px-3 py-1 text-sm",
                                  quizAnswers[i] === opt ? "bg-teal-500/30" : "bg-white/5 hover:bg-white/10")}>{opt}</button>
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
                      <div className="mb-2 flex items-center gap-2 text-sm text-white/80"><Building2 className="h-4 w-4 text-cyan-300" /> Project ideas</div>
                      <div className="flex snap-x snap-mandatory overflow-x-auto gap-3 pb-2">
                        {activeStage.regions.Global.projectIdeas.map((idea: string, i: number) => (
                          <motion.div key={i} whileHover={{ y: -2 }} className="snap-start min-w-[280px] rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                            <div className="mb-2 flex items-center gap-2 text-xs text-white/70"><Sparkles className="h-4 w-4 text-teal-200" /> Idea</div>
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

      <footer className="py-10 text-center text-xs text-white/50">Made for future engineers 🏗️</footer>
    </div>
  );
}
