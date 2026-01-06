import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Globe2,
  GraduationCap,
  Link2,
  ExternalLink,
  CalendarClock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const DISCIPLINE_STYLES: Record<string, { previewTint: string }> = {
  Physics: { previewTint: "bg-sky-400/25" },
  Chemistry: { previewTint: "bg-rose-400/25" },
  Biology: { previewTint: "bg-emerald-400/25" },
  "Computer Science": { previewTint: "bg-indigo-400/25" },
  Engineering: { previewTint: "bg-amber-400/25" },
  Mathematics: { previewTint: "bg-slate-400/25" },
  "Data Science": { previewTint: "bg-cyan-400/25" },
  "Economics & Business": { previewTint: "bg-amber-400/25" },
  Psychology: { previewTint: "bg-pink-400/25" },
  Education: { previewTint: "bg-fuchsia-400/25" },
  "Law & Political Science": { previewTint: "bg-zinc-400/25" },
  "Art & Design": { previewTint: "bg-violet-400/25" },
  "Communications & Media": { previewTint: "bg-teal-400/25" },
  "Environmental Science": { previewTint: "bg-lime-400/25" },
  Architecture: { previewTint: "bg-stone-400/25" },
  "Medicine & Healthcare": { previewTint: "bg-red-400/25" },
  "History & Literature": { previewTint: "bg-indigo-400/25" },
};

const HELP_AREA_STYLES: Record<string, { previewTint: string }> = {
  personal_statements: { previewTint: "bg-sky-300/25" },
  interviews: { previewTint: "bg-purple-300/25" },
  course_choices: { previewTint: "bg-emerald-300/25" },
  student_life: { previewTint: "bg-orange-300/25" },
  projects: { previewTint: "bg-pink-300/25" },
  apprenticeships: { previewTint: "bg-teal-300/25" },
};

const HELP_AREA_LABELS: Record<string, string> = {
  personal_statements: "Personal statements",
  interviews: "Interview prep",
  course_choices: "Course & university choices",
  student_life: "Student life",
  projects: "Projects & portfolio",
  apprenticeships: "Internships & apprenticeships",
};

export default function MentorShowcaseCard({ mentor }: any) {
  const navigate = useNavigate();
  const [bioExpanded, setBioExpanded] = useState(false);

  const bio = mentor.bio || "";
  const bioIsLong = bio.length > 160;

  const previewDisciplines = (mentor.disciplines || []).slice(0, 3);
  const previewHelpAreas = (mentor.helpAreas || []).slice(0, 4);

  const education =
    mentor.degree || mentor.university
      ? [mentor.degree, mentor.university].filter(Boolean).join(" · ")
      : "";

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.25 }}
      className="
        relative rounded-3xl border border-white/60 
        bg-slate-900/80 backdrop-blur-2xl
        shadow-[0_24px_80px_rgba(15,23,42,0.7)]
        p-6 text-white space-y-5
        overflow-hidden
      "
    >
      {/* Floating gradient blobs (EXACT MATCH) */}
      <div className="pointer-events-none absolute -top-20 -left-16 w-56 h-56 
        rounded-full bg-gradient-to-br from-blue-500/40 via-purple-500/30 
        to-transparent blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 right-[-5rem] w-64 h-64 
        rounded-full bg-gradient-to-tr from-purple-500/40 via-indigo-500/25 
        to-transparent blur-3xl" />

      <div className="relative z-10 space-y-6">

        {/* TOP: Avatar + Name + Affiliation */}
        <div className="flex gap-4 items-start">
          <div className="shrink-0">
            {mentor.imageUrl ? (
              <img
                src={mentor.imageUrl}
                className="w-28 h-28 rounded-3xl object-cover 
                  border border-white/40 shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br 
                from-blue-400 to-purple-500 flex items-center justify-center 
                border border-white/40 shadow-xl"
              >
                <Camera className="w-10 h-10 text-white/90" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold mb-1">
              Mentor
            </p>

            <h2 className="text-xl font-semibold text-slate-50 leading-tight break-words">
              {mentor.name}
            </h2>

            {mentor.headline && (
              <p className="text-xs text-slate-200/80 mt-0.5 leading-snug break-words">
                {mentor.headline}
              </p>
            )}

            {mentor.affiliationName && (
              <div className="mt-3 inline-flex items-center gap-1.5 
                rounded-xl bg-white/10 border border-white/25 px-3 py-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-200" />
                <span className="text-[11px] break-words">
                  {mentor.affiliationName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BIO */}
        {bio && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-1">
              Bio
            </p>

            <p
              className={`text-xs text-slate-100/90 ${
                bioExpanded ? "" : "line-clamp-2"
              }`}
            >
              {bio}
            </p>

            {bioIsLong && (
              <button
                onClick={() => setBioExpanded(!bioExpanded)}
                className="mt-1 text-[11px] text-slate-200/80 hover:text-white"
              >
                {bioExpanded ? "Show less ↑" : "Show more →"}
              </button>
            )}
          </div>
        )}

        {/* DISCIPLINES */}
        {previewDisciplines.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-1">
              Disciplines
            </p>

            <div className="flex flex-wrap gap-1.5">
              {previewDisciplines.map((d: string) => (
                <span
                  key={d}
                  className={`px-2.5 py-1 rounded-xl text-[11px] 
                    text-white border border-white/20 shadow-sm backdrop-blur-sm
                    ${DISCIPLINE_STYLES[d]?.previewTint ?? "bg-slate-500/25"}
                  `}
                >
                  {d}
                </span>
              ))}

              {mentor.disciplines.length > previewDisciplines.length && (
                <span className="px-2 py-1 rounded-xl text-[11px] bg-white/10 border border-white/20 text-slate-100/80">
                  +{mentor.disciplines.length - previewDisciplines.length} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* LANGUAGES */}
        {mentor.languages && (
          <div className="flex items-start gap-2 text-[11px] text-slate-200">
            <Globe2 className="w-3.5 h-3.5 mt-[2px] text-indigo-200" />
            <div>
              <p className="uppercase tracking-[0.14em] text-slate-400 font-semibold mb-0.5">
                Languages
              </p>
              <p className="text-slate-100/90 break-words">{mentor.languages}</p>
            </div>
          </div>
        )}

        {/* EXPERTISE */}
        {mentor.expertise && (
          <div className="flex items-start gap-2 text-[11px] text-slate-200">
            <Link2 className="w-3.5 h-3.5 mt-[2px] text-indigo-200" />
            <div>
              <p className="uppercase tracking-[0.14em] text-slate-400 font-semibold mb-0.5">
                Expertise
              </p>
              <p className="text-slate-100/90 break-words">{mentor.expertise}</p>
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {education && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-1">
              Education
            </p>
            <p className="text-xs text-slate-100/90">{education}</p>
          </div>
        )}

        {/* HELP AREAS */}
        {previewHelpAreas.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-1">
              How I can help
            </p>

            <div className="flex flex-wrap gap-1.5">
              {previewHelpAreas.map((id: string) => (
                <span
                  key={id}
                  className={`px-2 py-1 rounded-xl text-[11px] 
                    text-slate-50 border border-white/20 backdrop-blur-sm
                    ${HELP_AREA_STYLES[id]?.previewTint}
                  `}
                >
                  {HELP_AREA_LABELS[id]}
                </span>
              ))}

              {mentor.helpAreas.length > previewHelpAreas.length && (
                <span className="px-2 py-1 rounded-xl bg-white/8 border border-white/15 text-[11px] text-slate-100/80">
                  +{mentor.helpAreas.length - previewHelpAreas.length} more
                </span>
              )}
            </div>
          </div>
        )}

                {/* LINKS + CHAT */}
        {(mentor.linkedin || mentor.calendly) && (
          <div className="pt-2 border-t border-white/10 flex flex-wrap gap-3 text-[11px] text-slate-100/90">
            {mentor.linkedin && (
              <a
                href={mentor.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                LinkedIn
              </a>
            )}
            {mentor.calendly && (
              <a
                href={mentor.calendly}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-white"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                Book a call
              </a>
            )}

            {/* In-app chat */}
            {mentor.userId && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/chat/${mentor.userId}`, { state: { mentor } })
                }
                className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/25 text-[11px] hover:bg-white/15"
              >
                Message
              </button>
            )}
          </div>
        )}

      </div>
    </motion.div>
  );
}
