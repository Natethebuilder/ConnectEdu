import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
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
 * BiologyLearningHub.tsx — Apple+ level, discipline-themed, immersive
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
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------- 3D background ----------
function BiologyBG() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
        <color attach="background" args={["#0a1f0f"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} color="#10b981" intensity={0.8} />
        <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
          <mesh>
            <sphereGeometry args={[1.6, 64, 64]} />
            <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.35} transparent opacity={0.28} />
          </mesh>
        </Float>
        <Float speed={2.4} rotationIntensity={2}>
          <mesh position={[2.2, -1.3, 0]}>
            <sphereGeometry args={[0.9, 32, 32]} />
            <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.4} transparent opacity={0.22} />
          </mesh>
        </Float>
        <Float speed={1.6} rotationIntensity={1.5}>
          <mesh position={[-2.4, 1.2, -0.6]}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial color="#6ee7b7" emissive="#34d399" emissiveIntensity={0.35} transparent opacity={0.22} />
          </mesh>
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(16,185,129,.25),transparent),radial-gradient(50%_50%_at_80%_80%,rgba(52,211,153,.18),transparent)]" />
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
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
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
export default function BiologyLearningHub() {
  const { discipline = "biology" } = useParams();
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
        setStageState(progress.stage_state || {});
        setRegion(progress.region || "Global");
        setBookmarks(progress.bookmarks || []);
      } else {
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
    const q = activeStage.quiz || [];
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
        <BiologyBG />
        <div className="grid place-items-center min-h-screen">
          <div className="flex items-center gap-3 text-white/80">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading your Biology journey…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <BiologyBG />
      {/* Header / Hero */}
      <header className="relative mx-auto max-w-6xl px-6 pt-14">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springy}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 -z-10 blur-2xl bg-gradient-to-r from-emerald-500/40 to-green-500/40 rounded-full" />
            <div className="flex items-center justify-center gap-3 rounded-full bg-white/5 px-6 py-3 ring-1 ring-white/10 backdrop-blur">
              <Leaf className="h-6 w-6 text-emerald-300" />
              <p className="font-semibold tracking-wide">{titleCase(hub.discipline)} Learning Hub</p>
            </div>
          </div>
          <h1 className="text-balance bg-gradient-to-br from-white to-emerald-200 bg-clip-text text-center text-4xl font-extrabold text-transparent sm:text-6xl">
            "Life finds a way"
          </h1>
          <p className="max-w-2xl text-white/80">
            A guided journey through biology, with hands-on learning, curated resources, and progress that
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
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
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
                  persist(stageState, r);
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
                <span className="absolute -left-[9px] mt-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 ring-2 ring-emerald-300/50" />
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
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200 ring-1 ring-emerald-300/30 hover:bg-emerald-500/30"
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
                    <h4 className="mb-3 font-semibold text-emerald-200">Checklist</h4>
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
                                : "border-white/30 hover:border-emerald-300"
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
                    <h4 className="mb-2 font-semibold text-emerald-200">Curated Resources</h4>
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
                    <h4 className="mb-2 font-semibold text-emerald-200">Reflection</h4>
                    <textarea
                      className="min-h-[96px] w-full rounded-xl bg-white/10 p-3 text-sm text-white/90 
                                 placeholder:text-white/50 outline-none ring-1 ring-inset ring-white/15 
                                 focus:ring-emerald-400 transition"
                      placeholder="What did you explore, learn, or discover in this stage?"
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
                  {/* Quick Quiz */}
                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 backdrop-blur-md">
                    <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                      <GraduationCap className="h-4 w-4 text-emerald-300" /> Quick Quiz
                    </div>
                    <div className="space-y-3">
                      {(activeStage.quiz || []).map((Q: any, i: number) => (
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
                                    ? "bg-emerald-500/40 ring-1 ring-emerald-300/40"
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
                        <Sparkles className="h-4 w-4 text-emerald-300" /> Explore Biology Projects
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

      <footer className="py-10 text-center text-xs text-white/50">Made for learners who explore life 🌱</footer>
    </div>
  );
}
