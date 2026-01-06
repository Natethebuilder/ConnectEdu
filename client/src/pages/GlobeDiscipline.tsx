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
    // Backend expects 'course' parameter, not 'discipline'
    http
      .get("/universities", { params: { course: discipline } })
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
      transition={{ type: "spring", stiffness: 70, damping: 18 }}
      className="
        absolute right-0 top-0 bottom-0 z-[66]
        w-[420px] 
        backdrop-blur-2xl bg-white/10
        border-l border-white/20
        shadow-[0_8px_40px_rgba(0,0,0,0.4)]
        overflow-y-auto
      "
    >
      {/* HERO IMAGE */}
      <div className="relative h-64 w-full overflow-hidden rounded-bl-3xl rounded-br-none">
        <img
          src={photoFor(selected)}
          alt={selected.name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/universities/default.jpg";
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Close button */}
        <button
          onClick={closePanel}
          className="
            absolute top-4 right-4
            p-2 rounded-full 
            bg-black/40 hover:bg-black/60 
            text-white 
            backdrop-blur-md
            shadow-md
            transition
          "
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-semibold leading-tight drop-shadow-lg">
            {selected.name}
          </h3>
          <p className="text-sm opacity-80">
            #{selected.rank ?? "–"} · {selected.city}, {selected.country}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-6">

        {/* SUMMARY CARD */}
        <div
          className="
            p-5 rounded-2xl 
            bg-white/10 backdrop-blur-xl 
            border border-white/20 
            shadow-[0_4px_20px_rgba(0,0,0,0.2)]
          "
        >
          <h4 className="text-sm font-semibold text-white/90 mb-3">
            Overview
          </h4>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-white/80">City</div>
            <div className="text-white/100">{selected.city}</div>

            <div className="text-white/80">Country</div>
            <div className="text-white/100">{selected.country}</div>

            <div className="text-white/80">Rank</div>
            <div className="text-white/100">#{selected.rank}</div>

            <div className="text-white/80">Discipline</div>
            <div className="text-white/100">{prettyDiscipline}</div>
          </div>
        </div>

        {/* ENTRY REQUIREMENTS */}
        {entry && (
          <div
            className="
              p-5 rounded-2xl 
              bg-white/10 backdrop-blur-xl 
              border border-white/20
              shadow-[0_4px_20px_rgba(0,0,0,0.2)]
            "
          >
            <h4 className="text-sm font-semibold text-white/90 mb-3">
              Entry Requirements
            </h4>

            <ul className="space-y-2">
              {Object.entries(entry).map(([label, value]) => (
                <li
                  key={label}
                  className="
                    flex justify-between 
                    text-sm text-white/80 
                    border-b border-white/10 pb-1
                  "
                >
                  <span className="text-white/80">{label}</span>
                  <span className="font-medium text-white/100">{value as any}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* TUITION */}
        {(fees?.local || fees?.international) && (
          <div className="grid grid-cols-2 gap-4">
            <div
              className="
                p-4 rounded-2xl 
                bg-white/10 backdrop-blur-xl 
                border border-white/20 
                text-center shadow-md
              "
            >
              <div className="text-xs text-white/80">Local Fees</div>
              <div className="text-lg font-semibold text-white/100">
                {fees?.local ?? "—"}
              </div>
            </div>
            <div
              className="
                p-4 rounded-2xl 
                bg-white/10 backdrop-blur-xl 
                border border-white/20 
                text-center shadow-md
              "
            >
              <div className="text-xs text-white/60">International</div>
              <div className="text-lg font-semibold text-white/90">
                {fees?.international ?? "—"}
              </div>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {selected.website && (
            <motion.a
              whileHover={{ scale: 1.03 }}
              href={selected.website}
              target="_blank"
              rel="noreferrer"
              className="
                flex items-center justify-center gap-2
                rounded-xl px-4 py-2.5
                bg-black/80 text-white
                backdrop-blur-xl
                shadow-md hover:bg-black
                transition
              "
            >
              <ExternalLink className="w-4 h-4" />
              Website
            </motion.a>
          )}

          <motion.a
            whileHover={{ scale: 1.03 }}
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`}
            target="_blank"
            rel="noreferrer"
            className="
              flex items-center justify-center gap-2
              rounded-xl px-4 py-2.5
              bg-blue-600/90 text-white
              backdrop-blur-xl
              shadow-md hover:bg-blue-700
              transition
            "
          >
            Street View
          </motion.a>
        </div>
      </div>
    </motion.aside>
  )}
</AnimatePresence>

    </div>
  );
}
