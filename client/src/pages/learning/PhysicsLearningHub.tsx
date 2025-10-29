import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Atom,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Loader2,
  Star,
  X,
  Sparkles,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import http from "../../api/http";
import { saveQuizScore, saveReflection } from "../../hooks/useLearningProgress";

/**
 * PhysicsLearningHub.tsx — Apple+ level, discipline-themed, immersive
 * Dependencies: tailwindcss, framer-motion, lucide-react, @react-three/fiber, @react-three/drei
 */

// ---------- utils ----------
function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const springy = { type: "spring", stiffness: 180, damping: 22 } as const;

function titleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------- 3D background ----------
function NebulaBG() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={["#0b1026"]} />
        <Suspense fallback={null}>
          <Stars radius={80} depth={50} count={6000} factor={2} saturation={0} fade speed={0.8} />
        </Suspense>
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#7c3aed" />
        <pointLight position={[-6, -2, -4]} intensity={0.7} color="#60a5fa" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
      {/* Soft color washes to add depth over the 3D background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_10%,rgba(124,58,237,.25),transparent),radial-gradient(50%_50%_at_90%_80%,rgba(96,165,250,.22),transparent)]" />
    </div>
  );
}

// ---------- micro simulations (SVG, zero deps) ----------
function ProjectileSim() {
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(35);
  const g = 9.81;

  const points = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    const vx = speed * Math.cos(rad);
    const vy = speed * Math.sin(rad);
    const tMax = Math.max(0.1, (2 * vy) / g);
    const dt = tMax / 36;
    const pts: [number, number][] = [];
    for (let t = 0; t <= tMax; t += dt) {
      const x = vx * t;
      const y = vy * t - 0.5 * g * t * t;
      pts.push([x, Math.max(0, y)]);
    }
    const maxX = Math.max(...pts.map((p) => p[0])) || 1;
    const maxY = Math.max(...pts.map((p) => p[1])) || 1;
    return pts.map(([x, y]) => [((x / maxX) * 100) as number, 40 - ((y / maxY) * 35 + 5)] as [number, number]);
  }, [angle, speed]);

  const d = `M ${points.map((p) => p.join(",")).join(" L ")}`;

  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-white/80">Projectile Motion</p>
        <div className="text-xs text-white/60">{angle}° · {speed} m/s</div>
      </div>
      <svg viewBox="0 0 100 40" className="w-full h-40 rounded-xl bg-gradient-to-b from-white/5 to-transparent">
        <defs>
          <linearGradient id="trail" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="url(#trail)" strokeWidth={1.8} />
        <line x1="0" x2="100" y1="39" y2="39" stroke="rgba(255,255,255,.25)" />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-xs text-white/70">
          Angle
          <input type="range" min={10} max={80} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full" />
        </label>
        <label className="text-xs text-white/70">
          Speed
          <input type="range" min={5} max={60} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full" />
        </label>
      </div>
    </div>
  );
}

function PendulumSim() {
  const [length, setLength] = useState(1);
  const [theta0, setTheta0] = useState(20);
  const t = useMotionValue(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      t.set(t.get() + 0.016);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [t]);

  const theta = useTransform(t, (time) => {
    const g = 9.81;
    const w = Math.sqrt(g / Math.max(0.2, length));
    return ((theta0 * Math.PI) / 180) * Math.cos(w * time);
  });

  const x = useTransform(theta, (th) => 50 + Math.sin(th) * 30);
  const y = useTransform(theta, (th) => 10 + Math.cos(th) * 30);

  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-white/80">Simple Pendulum</p>
        <div className="text-xs text-white/60">L = {length.toFixed(1)} m</div>
      </div>
      <svg viewBox="0 0 100 60" className="w-full h-40 rounded-xl bg-gradient-to-b from-white/5 to-transparent">
        <motion.line x1="50" y1="0" x2={x} y2={y} stroke="rgba(255,255,255,.4)" strokeWidth={1.5} />
        <motion.circle cx={x} cy={y} r="4" fill="#c4b5fd" />
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-xs text-white/70">
          Length (m)
          <input type="range" min={0.2} max={2} step={0.1} value={length} onChange={(e) => setLength(+e.target.value)} className="w-full" />
        </label>
        <label className="text-xs text-white/70">
          Amplitude (°)
          <input type="range" min={5} max={45} value={theta0} onChange={(e) => setTheta0(+e.target.value)} className="w-full" />
        </label>
      </div>
    </div>
  );
}

// ---------- Resource Card ----------
type Resource = {
  title: string;
  type: string;
  link: string;
  platform: string;
  estimatedHours?: number;
};

function ResourceCard({ r, bookmarked, onBookmark }: { r: Resource; bookmarked?: boolean; onBookmark?: () => void }) {
  return (
    <motion.a
      href={r.link}
      target="_blank"
      rel="noreferrer"
      whileHover={{ y: -4 }}
      className="group relative block rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-1 flex items-center gap-2 text-xs text-white/70">
          <span className="px-2 py-0.5 rounded-full bg-white/10">{r.platform}</span>
          <span>•</span>
          <span>{r.type}</span>
          {typeof r.estimatedHours === "number" && <span>• {r.estimatedHours}h</span>}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold text-white/90">{r.title}</h4>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-white/60" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onBookmark?.();
              }}
              className="rounded-full bg-white/10 p-1 hover:bg-white/20"
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-emerald-300" />
              ) : (
                <Bookmark className="h-4 w-4 text-white/70" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

// ---------- Project Carousel ----------
function ProjectCarousel({ ideas }: { ideas: string[] }) {
  return (
    <div className="relative">
      <div className="flex snap-x snap-mandatory overflow-x-auto gap-4 pb-2">
        {ideas.map((idea, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="snap-start min-w-[280px] rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur"
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-white/70">
              <Sparkles className="h-4 w-4 text-yellow-200" /> Project Idea
            </div>
            <p className="text-white/85">{idea}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function PhysicsLearningHub() {
  const { discipline = "physics" } = useParams();
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
      console.log("✅ Loaded progress:", progress.stage_state); // <— debug line
      setStageState(progress.stage_state || {});
      setRegion(progress.region || "Global");
      setBookmarks(progress.bookmarks || []);
    } else {
      console.log("ℹ️ No saved progress found for this user.");
      setStageState({});
    }

    setLoading(false);
  }

  init();

  return () => {
    mounted = false;
  };
}, [discipline]);



  const allRegions: string[] = useMemo(
    () => hub?.availableRegions || Object.keys(hub?.stages?.[0]?.regions || { Global: true }),
    [hub]
  );

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
  updatedStageState: Record<string, any> = stageState,
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

  // merge: keep all regions, patch just the current one
  const merged = {
    ...serverState,
    ...updatedStageState,
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
    { onConflict: "user_id,discipline" } // 👈 IMPORTANT
  )
  .select(); // (optional) return the row


  setStageState(merged);
}














  function isBookmarked(link: string) {
    return bookmarks?.some((b) => b.link === link);
  }

  function toggleBookmark(r: Resource) {
    const exists = bookmarks.some((b: any) => b.link === r.link);
    const next = exists ? bookmarks.filter((b: any) => b.link !== r.link) : [...bookmarks, r];
    setBookmarks(next);
    persist(stageState, region, next);
  }

   // checklist toggler
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







  useEffect(() => {
    if (!activeStage) return;
    const q =
      activeStage.quiz ||
      [
        {
          q: `What is emphasized in "${activeStage.title}"?`,
          opts: ["Vision & direction", "Memorization", "Graphic design", "Public speaking"],
          correct: "Vision & direction",
        },
        {
          q: "Which skill is core to physics?",
          opts: ["Mathematical reasoning", "Rote copying", "Fashion", "Vocabulary"],
          correct: "Mathematical reasoning",
        },
      ];
    const allAnswered = Object.keys(quizAnswers).length >= q.length;
    if (allAnswered) {
      const score = q.reduce((acc: number, cur: any, i: number) => acc + (quizAnswers[i] === cur.correct ? 1 : 0), 0);
      const pct = Math.round((score / q.length) * 100);
      setQuizScore(pct);
      if (user?.id) saveQuizScore(user.id, discipline, activeStage.id, pct);
    } else {
      setQuizScore(null);
    }
  }, [quizAnswers, activeStage, user?.id, discipline]);

  if (loading || !hub) {
    return (
      <div className="relative min-h-screen">
        <NebulaBG />
        <div className="grid place-items-center min-h-screen">
          <div className="flex items-center gap-3 text-white/80">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading your Physics journey…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <NebulaBG />
      {/* Header / Hero */}
      <header className="relative mx-auto max-w-6xl px-6 pt-14">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springy}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-indigo-500/40 to-fuchsia-500/40 rounded-full" />
            <div className="flex items-center justify-center gap-3 rounded-full bg-white/5 px-6 py-3 ring-1 ring-white/10 backdrop-blur">
              <Atom className="h-6 w-6 text-indigo-300" />
              <p className="font-semibold tracking-wide">{titleCase(hub.discipline)} Learning Hub</p>
            </div>
          </div>
          <h1 className="text-balance bg-gradient-to-br from-white to-indigo-200 bg-clip-text text-center text-4xl font-extrabold text-transparent sm:text-6xl">
            "Reach for the moon, if you miss you'll land on the stars"
          </h1>
          <p className="max-w-2xl text-white/80">
            A guided journey through physics, with hands-on simulations, curated resources, and progress that
            adapts to your selected region.
          </p>
          {/* progress ring */}
          <div className="relative grid place-items-center">
            <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow">
              <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,.12)" strokeWidth="10" fill="none" />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                strokeWidth="10"
                stroke="url(#grad)"
                strokeLinecap="round"
                strokeDasharray={`${Math.PI * 2 * 52}`}
                strokeDashoffset={(1 - overallProgress / 100) * Math.PI * 2 * 52}
                initial={{ strokeDashoffset: Math.PI * 2 * 52 }}
                animate={{ strokeDashoffset: (1 - overallProgress / 100) * Math.PI * 2 * 52 }}
                transition={springy}
              />
              <defs>
                <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#60a5fa" />
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
                <span className="absolute -left-[9px] mt-1 grid h-4 w-4 place-items-center rounded-full bg-indigo-400 ring-2 ring-indigo-300/50" />
                <motion.div
                  whileHover={{ y: -2 }}
                  className="rounded-2xl bg-white/5 p-5 backdrop-blur ring-1 ring-white/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        <span className="mr-2 text-white/70">Stage {idx + 1}:</span> {stage.title}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-white/70">{stage.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {pct}%
                      </div>
                      <button
                        onClick={() => setActiveStage(stage)}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-3 py-1 text-indigo-200 ring-1 ring-indigo-300/30 hover:bg-indigo-500/30"
                      >
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
            <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Bookmark className="h-5 w-5" /> Your bookmarks
            </h4>
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
        {/* Close Button */}
        <button
          onClick={() => setActiveStage(null)}
          className="absolute right-3 top-3 rounded-full bg-white/15 p-2 hover:bg-white/25"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 p-6 sm:grid-cols-5">
          {/* LEFT COLUMN */}
          <div className="sm:col-span-3 space-y-6">
            {/* Title & Description */}
            <div>
              <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
                {activeStage.title}
              </h3>
              <p className="mt-1 text-sm text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                {activeStage.description}
              </p>
            </div>

            {/* Region Overview */}
            <div className="rounded-2xl bg-black/35 p-4 ring-1 ring-white/10 backdrop-blur-md">
              <p className="text-sm text-white/90 leading-relaxed">
                {(activeStage.regions?.[region] || activeStage.regions?.Global)?.overview}
              </p>
            </div>

            {/* Checklist */}
            <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
              <h4 className="mb-3 font-semibold text-indigo-200">Checklist</h4>
              <ul className="space-y-2">
                {(activeStage.regions?.[region] || activeStage.regions?.Global)?.checklist?.map((task: string) => (
                  <li
                    key={task}
                    className="flex items-start gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 hover:bg-white/10 transition"
                  >
                    <button
                      onClick={() => toggleTask(activeStage.id, task)}
                      className={cx(
                        "mt-0.5 grid h-5 w-5 place-items-center rounded-full border transition",
                        stageState?.[region]?.[activeStage.id]?.checklist?.[task]
                          ? "border-emerald-400 bg-emerald-400/25"
                          : "border-white/30 hover:border-indigo-300"
                      )}
                    >
                      {stageState?.[region]?.[activeStage.id]?.checklist?.[task] && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      )}
                    </button>
                    <span className="text-sm text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                      {task}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Curated Resources */}
            <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
              <h4 className="mb-2 font-semibold text-indigo-200">Curated Resources</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {(activeStage.regions?.[region] || activeStage.regions?.Global)?.resources?.map((r: Resource) => (
                  <ResourceCard
                    key={r.link}
                    r={r}
                    bookmarked={isBookmarked(r.link)}
                    onBookmark={() => toggleBookmark(r)}
                  />
                ))}
              </div>
            </div>

            {/* Reflection Box */}
            <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
              <h4 className="mb-2 font-semibold text-indigo-200">Reflection</h4>
              <textarea
                className="min-h-[96px] w-full rounded-xl bg-white/10 p-3 text-sm text-white/90 
                           placeholder:text-white/50 outline-none ring-1 ring-inset ring-white/15 
                           focus:ring-indigo-400 transition"
                placeholder="What did you explore, prove, or build in this stage?"
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

          {/* RIGHT COLUMN */}
          <div className="sm:col-span-2 flex flex-col gap-4">
            {/* Simulations */}
            <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
              <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                <Star className="h-4 w-4 text-yellow-300" /> Physics Playground
              </div>
              <div className="grid gap-3">
                <ProjectileSim />
                <PendulumSim />
              </div>
            </div>

            {/* Quick Quiz */}
            <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
              <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                <GraduationCap className="h-4 w-4 text-indigo-300" /> Quick Quiz
              </div>
              <div className="space-y-3">
                {(activeStage.quiz || [
                  {
                    q: `What is emphasized in "${activeStage.title}"?`,
                    opts: ["Vision & direction", "Memorization", "Graphic design", "Public speaking"],
                    correct: "Vision & direction",
                  },
                ]).map((Q: any, i: number) => (
                  <div key={i}>
                    <p className="text-sm text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{Q.q}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Q.opts.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [i]: opt }))}
                          className={cx(
                            "rounded-full border border-white/15 px-3 py-1 text-sm transition",
                            quizAnswers[i] === opt
                              ? "bg-indigo-500/40 ring-1 ring-indigo-300/40"
                              : "bg-white/10 hover:bg-white/15"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {quizScore !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-emerald-300 font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
                >
                  ✅ You scored {quizScore}%
                </motion.div>
              )}
            </div>

            {/* Projects */}
            {activeStage.regions?.Global?.projectIdeas && (
              <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                  <Sparkles className="h-4 w-4 text-fuchsia-300" /> Explore Physics Projects
                </div>
                <ProjectCarousel ideas={activeStage.regions.Global.projectIdeas} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      <footer className="py-10 text-center text-xs text-white/50">Made for learners who aim for orbit 🚀</footer>
    </div>
  );
}
