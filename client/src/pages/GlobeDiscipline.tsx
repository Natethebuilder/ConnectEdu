import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import type { University } from "../types";
import Globe from "../components/Globe";
import { ExternalLink, GraduationCap, MessageCircle, X, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { titleCase } from "../utils/format";

export default function GlobeDiscipline() {
  const { discipline = "" } = useParams();
  const navigate = useNavigate();

  const [universities, setUniversities] = useState<University[]>([]);
  const [selected, setSelected] = useState<University | undefined>();
  const [resetFocus, setResetFocus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const prettyDiscipline = titleCase(discipline);

  // Fetch universities for this discipline
  useEffect(() => {
    setLoading(true);
    setSelected(undefined);
    http
      .get("/universities", { params: { discipline } }) // make sure backend uses this param
      .then((res) => setUniversities(res.data || []))
      .finally(() => setLoading(false));
  }, [discipline]);

  // 🔧 NEW: filter by discipline first (handle both stored field and programs key)
  const filtered = useMemo(
    () =>
      (universities || []).filter(
        (u) =>
          (u as any).discipline?.toLowerCase() === discipline ||
          Boolean(u?.programs && (u.programs as any)[discipline])
      ),
    [universities, discipline]
  );

  // Top 10 within this discipline, sorted by numeric rank
  const top10 = useMemo(
    () =>
      [...filtered]
        .sort(
          (a, b) =>
            (Number(a.rank) || Number.MAX_SAFE_INTEGER) -
            (Number(b.rank) || Number.MAX_SAFE_INTEGER)
        )
        .slice(0, 10),
    [filtered]
  );

  const photoFor = (u?: University) =>
    u?.photoUrl ||
    `/images/universities/${encodeURIComponent(u?.name || "default")}.jpg`;

  const fees = selected?.programs?.[discipline]?.fees;
  const entry = selected?.programs?.[discipline]?.entryRequirements;
  const [lon, lat] = selected?.location.coordinates || [0, 0];

  function closePanel() {
    setSelected(undefined);
    setResetFocus(true);
    setTimeout(() => setResetFocus(false), 500);
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Ambient blobs */}
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="pointer-events-none absolute top-24 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="pointer-events-none absolute bottom-24 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply blur-3xl opacity-30"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[70] grid place-items-center bg-white/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-white/60 bg-white/85 shadow-lg px-6 py-4 text-center"
          >
            <p className="text-sm text-gray-600">Finding universities…</p>
            <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {prettyDiscipline}
            </p>
          </motion.div>
        </div>
      )}

      {/* Globe */}
      <div className="absolute inset-0 z-10">
        <Globe
          universities={top10}
          focus={
            selected
              ? { coords: selected.location.coordinates, level: "university" }
              : undefined
          }
          onUniversitySelect={setSelected}
          onUniversityHover={setHoveredId}
          hoveredId={hoveredId}
          resetFocus={resetFocus}
        />
      </div>

      {/* Toggle Top 10 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowList((s) => !s)}
        className={`absolute top-20 left-6 z-[65] px-5 py-2 rounded-full
             flex items-center gap-2 text-sm font-semibold
             backdrop-blur-xl border transition-all
             ${
               showList
                 ? "bg-black/50 border-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                 : "bg-gradient-to-br from-white/20 to-white/10 border-white/30 text-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]"
             }`}
        aria-expanded={showList}
        aria-controls="top10-panel"
      >
        <List className="w-4 h-4 opacity-90" />
        <span>{showList ? "Hide Top 10" : "Show Top 10"}</span>
      </motion.button>

      {/* Slide-in Top 10 List */}
      <AnimatePresence>
        {showList && (
          <motion.div
            id="top10-panel"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="absolute top-36 left-6 z-[65] w-[360px] max-h-[65vh] overflow-y-auto
             rounded-2xl p-5
             bg-black/50 backdrop-blur-2xl
             border border-white/20 ring-1 ring-white/10
             shadow-[0_8px_40px_rgba(0,0,0,0.65)]
             text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-wide text-white/90">
                Top 10 Universities
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full
                    bg-white/10 border border-white/20
                    text-white/80">
                {prettyDiscipline}
              </span>
            </div>

            <ol className="space-y-2">
              {top10.map((u, i) => {
                // ✅ rank badge uses real rank, falls back to list index
                const r = Number(u.rank);
                const displayRank = Number.isFinite(r) && r > 0 ? r : i + 1;

                return (
                  <motion.li key={u._id} whileHover={{ x: 4 }}>
                    <button
                      onClick={() => setSelected(u)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 
                       transition backdrop-blur-md
                       ${hoveredId === u._id ? "bg-white/10" : "hover:bg-white/5"} 
                       focus:outline-none focus:ring-2 focus:ring-white/60`}
                      onMouseEnter={() => setHoveredId(u._id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <span
                        className={[
                          "w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-extrabold shrink-0 shadow-md",
                          displayRank === 1
                            ? "bg-gradient-to-br from-yellow-400 to-amber-300 text-black"
                            : displayRank === 2
                            ? "bg-gradient-to-br from-slate-200 to-slate-400 text-black"
                            : displayRank === 3
                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                            : "bg-gradient-to-br from-blue-500 to-purple-500 text-white",
                        ].join(" ")}
                      >
                        {displayRank}
                      </span>

                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-semibold leading-tight truncate text-white/90">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-white/60 leading-tight truncate">
                          {u.city} · {u.country}
                        </p>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info panel */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            key={selected._id}
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="absolute right-0 top-0 bottom-0 z-[66] w-[420px] overflow-y-auto bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/60"
            aria-label="University details"
          >
            {/* Hero */}
            <div className="relative">
              <img
                src={photoFor(selected)}
                alt={selected?.name}
                className="h-52 w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/images/universities/default.jpg";
                }}
              />
              <button
                onClick={closePanel}
                className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-white/80"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-xl font-bold text-white">{selected?.name}</h3>
                <p className="text-sm text-gray-200">
                  #{selected?.rank ?? "–"} · {selected?.city} · {selected?.country}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {entry && (
                <section>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Entry Requirements
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {Object.entries(entry).map(([k, v]) => (
                      <li key={k} className="flex gap-2">
                        <span className="min-w-[110px] text-gray-500">{k}:</span>
                        <span className="font-medium">{v as any}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(fees?.local || fees?.international) && (
                <section className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200/70 bg-white/70 p-3 text-center">
                    <div className="text-xs text-gray-500">Local Fees</div>
                    <div className="text-base font-semibold">{fees?.local ?? "—"}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200/70 bg-white/70 p-3 text-center">
                    <div className="text-xs text-gray-500">International</div>
                    <div className="text-base font-semibold">{fees?.international ?? "—"}</div>
                  </div>
                </section>
              )}

              <section className="grid grid-cols-2 gap-3">
                {selected?.website && (
                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    href={selected.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-gray-900 text-white hover:bg-black transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </motion.a>
                )}

                <motion.a
                  whileHover={{ scale: 1.03 }}
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Street View
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    navigate(`/learning/${discipline}`, {
                      state: { university: selected },
                    });
                  }}
                >
                  <GraduationCap className="h-4 w-4" />
                  Open Learning Hub
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() =>
                    navigate(
                      `/alumni-chat?u=${encodeURIComponent(selected?.name || "")}`
                    )
                  }
                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with Alumni
                </motion.button>
              </section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
