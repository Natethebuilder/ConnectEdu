import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useSupabaseAuth } from "../store/supabaseAuth";
import http from "../api/http";
import {
  Camera,
  Loader2,
  Check,
  Globe2,
  GraduationCap,
  Link2,
  ExternalLink,
  CalendarClock,
} from "lucide-react";

type MentorProfileResponse = {
  userId: string;
  name: string;
  headline?: string;
  bio?: string;
  expertise?: string[];
  languages?: string[];
  university?: string;
  degree?: string;
  linkedin?: string;
  calendly?: string;
  imageUrl?: string;
  disciplines?: string[];
  affiliationType?: "university" | "company" | "independent";
  affiliationName?: string;
  helpAreas?: string[];
};

const ACCENT_GRADIENT = "from-blue-600 to-purple-600";

// Discipline styling: light (unselected), selected gradient, preview tint
const DISCIPLINE_STYLES: Record<
  string,
  { light: string; selected: string; previewTint: string }
> = {
  Physics: {
    light: "bg-sky-50 border-sky-200 text-sky-800",
    selected: "from-sky-300 to-sky-500",
    previewTint: "bg-sky-400/25",
  },
  Chemistry: {
    light: "bg-rose-50 border-rose-200 text-rose-800",
    selected: "from-rose-300 to-rose-500",
    previewTint: "bg-rose-400/25",
  },
  Biology: {
    light: "bg-emerald-50 border-emerald-200 text-emerald-800",
    selected: "from-emerald-300 to-emerald-500",
    previewTint: "bg-emerald-400/25",
  },
  "Computer Science": {
    light: "bg-indigo-50 border-indigo-200 text-indigo-800",
    selected: "from-indigo-300 to-indigo-500",
    previewTint: "bg-indigo-400/25",
  },
  Engineering: {
    light: "bg-amber-50 border-amber-200 text-amber-800",
    selected: "from-amber-300 to-amber-500",
    previewTint: "bg-amber-400/25",
  },
  Mathematics: {
    light: "bg-slate-50 border-slate-200 text-slate-800",
    selected: "from-slate-300 to-slate-500",
    previewTint: "bg-slate-400/25",
  },
  "Data Science": {
    light: "bg-cyan-50 border-cyan-200 text-cyan-800",
    selected: "from-cyan-300 to-cyan-500",
    previewTint: "bg-cyan-400/25",
  },
  "Economics & Business": {
    light: "bg-amber-50 border-amber-200 text-amber-800",
    selected: "from-yellow-300 to-amber-400",
    previewTint: "bg-amber-400/25",
  },
  Psychology: {
    light: "bg-pink-50 border-pink-200 text-pink-800",
    selected: "from-pink-300 to-pink-500",
    previewTint: "bg-pink-400/25",
  },
  Education: {
    light: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800",
    selected: "from-fuchsia-300 to-fuchsia-500",
    previewTint: "bg-fuchsia-400/25",
  },
  "Law & Political Science": {
    light: "bg-zinc-50 border-zinc-200 text-zinc-800",
    selected: "from-zinc-300 to-zinc-500",
    previewTint: "bg-zinc-400/25",
  },
  "Art & Design": {
    light: "bg-violet-50 border-violet-200 text-violet-800",
    selected: "from-violet-300 to-violet-500",
    previewTint: "bg-violet-400/25",
  },
  "Communications & Media": {
    light: "bg-teal-50 border-teal-200 text-teal-800",
    selected: "from-teal-300 to-teal-500",
    previewTint: "bg-teal-400/25",
  },
  "Environmental Science": {
    light: "bg-lime-50 border-lime-200 text-lime-800",
    selected: "from-lime-300 to-lime-500",
    previewTint: "bg-lime-400/25",
  },
  Architecture: {
    light: "bg-stone-50 border-stone-200 text-stone-800",
    selected: "from-stone-300 to-stone-500",
    previewTint: "bg-stone-400/25",
  },
  "Medicine & Healthcare": {
    light: "bg-red-50 border-red-200 text-red-800",
    selected: "from-red-300 to-red-500",
    previewTint: "bg-red-400/25",
  },
  "History & Literature": {
    light: "bg-indigo-50 border-indigo-200 text-indigo-800",
    selected: "from-indigo-300 to-indigo-500",
    previewTint: "bg-indigo-400/25",
  },
};

const DISCIPLINE_OPTIONS = Object.keys(DISCIPLINE_STYLES);

// ★ PASTEL HELP AREA STYLES (lighter than before)
const HELP_AREA_STYLES: Record<
  string,
  { selected: string; previewTint: string }
> = {
  personal_statements: {
    selected: "from-sky-200 to-sky-400",
    previewTint: "bg-sky-300/25",
  },
  interviews: {
    selected: "from-purple-200 to-purple-400",
    previewTint: "bg-purple-300/25",
  },
  course_choices: {
    selected: "from-emerald-200 to-emerald-400",
    previewTint: "bg-emerald-300/25",
  },
  student_life: {
    selected: "from-orange-200 to-orange-400",
    previewTint: "bg-orange-300/25",
  },
  projects: {
    selected: "from-pink-200 to-pink-400",
    previewTint: "bg-pink-300/25",
  },
  apprenticeships: {
    selected: "from-teal-200 to-teal-400",
    previewTint: "bg-teal-300/25",
  },
};

const HELP_AREAS = [
  {
    id: "personal_statements",
    label: "Personal statements",
    description: "Brainstorming, structure, feedback for applications.",
  },
  {
    id: "interviews",
    label: "Interview prep",
    description: "Mock interviews, confidence, and common questions.",
  },
  {
    id: "course_choices",
    label: "Course & university choices",
    description: "Choosing the right program and country.",
  },
  {
    id: "student_life",
    label: "Student life",
    description: "Accommodation, social life, study balance.",
  },
  {
    id: "projects",
    label: "Projects & portfolio",
    description: "Ideas, portfolio review, competitions.",
  },
  {
    id: "apprenticeships",
    label: "Internships & apprenticeships",
    description: "Opportunities, CV review, early career steps.",
  },
];

const helpAreaLabel = (id: string) =>
  HELP_AREAS.find((h) => h.id === id)?.label ?? id;

export default function MentorOnboarding() {
  const { user, role } = useSupabaseAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState("");
  const [languages, setLanguages] = useState("");

  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [helpAreas, setHelpAreas] = useState<string[]>([]);

  const [affiliationType, setAffiliationType] =
    useState<"university" | "company">("university");
  const [affiliationName, setAffiliationName] = useState("");

  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");

  const [linkedin, setLinkedin] = useState("");
  const [calendly, setCalendly] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [bioExpanded, setBioExpanded] = useState(false);
  // Guard
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (role !== "mentor") {
      navigate("/discipline-choice");
      return;
    }
  }, [user, role, navigate]);

  // Load existing profile
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const res = await http.get<MentorProfileResponse>("/api/mentors/me", {
          params: { userId: user.id },
        });
        const p = res.data;

        setName(p.name ?? user.name ?? "");
        setHeadline(p.headline ?? "");
        setBio(p.bio ?? "");
        setExpertise((p.expertise ?? []).join(", "));
        setLanguages((p.languages ?? []).join(", "));
        setUniversity(p.university ?? "");
        setDegree(p.degree ?? "");
        setLinkedin(p.linkedin ?? "");
        setCalendly(p.calendly ?? "");

        setDisciplines(p.disciplines ?? []);
        setHelpAreas(p.helpAreas ?? []);

        const loadedAffType =
          p.affiliationType === "company" ? "company" : "university";
        setAffiliationType(loadedAffType);
        setAffiliationName(p.affiliationName ?? "");

        if (p.imageUrl) setImagePreview(p.imageUrl);
      } catch {
        setName(user.name ?? "");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImageIfNeeded(): Promise<string | undefined> {
    if (!imageFile || !user) return imagePreview || undefined;

    const ext = imageFile.name.split(".").pop() || "jpg";
    const filePath = `mentor-avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("mentor-photos")
      .upload(filePath, imageFile, {
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error("Failed to upload profile picture.");
    }

    const { data } = supabase.storage
      .from("mentor-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    if (list.includes(value)) {
      setter(list.filter((x) => x !== value));
    } else {
      setter([...list, value]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const imageUrl = await uploadImageIfNeeded();

      await http.post("/api/mentors/me", {
        userId: user.id,
        name,
        headline,
        bio,
        expertise,
        languages,
        university,
        degree,
        linkedin,
        calendly,
        imageUrl,
        disciplines,
        affiliationType,
        affiliationName,
        helpAreas,
      });

      navigate("/mentor-dashboard", { replace: true });
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save mentor profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-600">
        Loading mentor setup...
      </div>
    );
  }

  const affiliationLabel =
    affiliationType === "university" ? "University" : "Company";

  const bioValue = bio.trim();
  const bioIsLong = bioValue.length > 160;

  const educationDisplay =
    degree || university
      ? [degree, university].filter(Boolean).join(" · ")
      : "";

  const previewDisciplines = disciplines.slice(0, 3);
  const previewHelpAreas = helpAreas.slice(0, 4);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-6 py-10 sm:py-16 flex justify-center">
      {/* background blobs */}
      <motion.div
        animate={{ y: [0, 40, 0], opacity: [0.25, 0.6, 0.25] }}
        transition={{ duration: 13, repeat: Infinity }}
        className="pointer-events-none absolute top-16 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -40, 0], opacity: [0.25, 0.7, 0.25] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="pointer-events-none absolute bottom-16 right-10 w-[24rem] h-[24rem] bg-purple-400 rounded-full mix-blend-multiply blur-3xl opacity-30"
      />

      <div className="relative w-full max-w-6xl z-10">
        {/* header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-gray-200 shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Mentor onboarding
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
            Craft a profile students instantly trust
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
            This is exactly how you’ll appear in the{" "}
            <span className="font-semibold">Mentor Hub</span> when students
            search by discipline, language, and support type.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-10 lg:grid-cols-[320px,1fr]"
        >
          {/* LEFT: spotlight preview */}
          <div className="space-y-8">
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ layout: { duration: 0.25, ease: "easeInOut" }}}
              className="relative rounded-3xl border border-white/60 bg-slate-900/80 shadow-[0_24px_80px_rgba(15,23,42,0.7)] backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute -top-20 -left-16 w-56 h-56 rounded-full bg-gradient-to-br from-blue-500/40 via-purple-500/30 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 right-[-5rem] w-64 h-64 rounded-full bg-gradient-to-tr from-purple-500/40 via-indigo-500/25 to-transparent blur-3xl" />

              <div className="relative p-6 space-y-5 text-white">
                <div className="flex gap-4 items-start">
  {/* LEFT: Avatar */}
  <div className="shrink-0">
    <div className="relative">
      {imagePreview ? (
        <img
          src={imagePreview}
          alt="avatar"
          className="w-28 h-28 rounded-3xl object-cover border border-white/40 shadow-xl"
        />
      ) : (
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border border-white/40 shadow-xl">
          <Camera className="w-10 h-10 text-white/90" />
        </div>
      )}

      <label className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg cursor-pointer">
        <Camera className="w-3.5 h-3.5 text-gray-800" />
        <input type="file" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  </div>

  {/* RIGHT: All top-content aligned at the top */}
  <div className="min-w-0 flex-1">
    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold mb-1">
      Profile preview
    </p>

    <h2 className="text-xl font-semibold text-slate-50 break-words leading-tight">
      {name}
    </h2>

    {headline && (
      <p className="text-xs text-slate-200/80 break-words leading-snug mt-0.5">
        {headline}
      </p>
    )}

    {/* LEFT-ALIGNED affiliation */}
    {affiliationName && (
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/25 px-3 py-1.5 w-fit max-w-full">
        <GraduationCap className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
        <span className="text-[11px] font-medium text-slate-100 break-words whitespace-normal">
          {affiliationName}
        </span>
      </div>
    )}
  </div>
</div>


                {/* BIO */}
                {bioValue && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-1">
                      Bio
                    </p>
                    <motion.div layout className="text-xs text-slate-100/90">
                      <p className={bioExpanded ? "" : "line-clamp-2"}>
                        {bioValue}
                      </p>
                    </motion.div>
                    {bioIsLong && (
                      <button
                        type="button"
                        onClick={() => setBioExpanded((v) => !v)}
                        className="mt-1 text-[11px] text-slate-200/80 hover:text-white"
                      >
                        {bioExpanded ? "Show less ↑" : "Show more →"}
                      </button>
                    )}
                  </div>
                )}

                {/* Disciplines */}
                {previewDisciplines.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-1">
                      Disciplines
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {previewDisciplines.map((d) => {
                        const style = DISCIPLINE_STYLES[d];
                        const tint = style?.previewTint ?? "bg-slate-500/30";
                        return (
                          <span
                            key={d}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium text-white backdrop-blur-sm border border-white/20 shadow-sm ${tint}`}
                          >
                            {d}
                          </span>
                        );
                      })}
                      {disciplines.length > previewDisciplines.length && (
                        <span className="px-2 py-1 rounded-xl text-[11px] font-medium bg-white/8 border border-white/20 text-slate-100/80">
                          +{disciplines.length - previewDisciplines.length} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {languages.trim() && (
                  <div className="flex items-start gap-2 text-[11px] text-slate-200">
                    <Globe2 className="w-3.5 h-3.5 mt-[2px] text-indigo-200" />
                    <div>
                      <p className="uppercase tracking-[0.14em] text-slate-400 font-semibold mb-0.5">
                        Languages
                      </p>
                      <p className="text-slate-100/90">{languages}</p>
                    </div>
                  </div>
                )}

                {/* Expertise */}
                {expertise.trim() && (
                  <div className="flex items-start gap-2 text-[11px] text-slate-200">
                    <Link2 className="w-3.5 h-3.5 mt-[2px] text-indigo-200" />
                    <div>
                      <p className="uppercase tracking-[0.14em] text-slate-400 font-semibold mb-0.5">
                        Expertise
                      </p>
                      <p className="text-slate-100/90">{expertise}</p>
                    </div>
                  </div>
                )}

                {/* Education */}
                {educationDisplay && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-1">
                      Education
                    </p>
                    <p className="text-xs text-slate-100/90">
                      {educationDisplay}
                    </p>
                  </div>
                )}

                {/* How I can help */}
                {previewHelpAreas.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-1">
                      How I can help
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {previewHelpAreas.map((id) => {
                        const style = HELP_AREA_STYLES[id];
                        const tint = style?.previewTint ?? "bg-purple-500/20";
                        return (
                          <span
                            key={id}
                            className={`px-2 py-1 rounded-xl text-[11px] text-slate-50 border border-white/20 backdrop-blur-sm shadow-sm ${tint}`}
                          >
                            {helpAreaLabel(id)}
                          </span>
                        );
                      })}
                      {helpAreas.length > previewHelpAreas.length && (
                        <span className="px-2 py-1 rounded-xl bg-white/8 border border-white/15 text-[11px] text-slate-100/80">
                          +{helpAreas.length - previewHelpAreas.length} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Links */}
                {(linkedin || calendly) && (
                  <div className="pt-2 border-t border-white/10 flex flex-wrap gap-3 text-[11px] text-slate-100/90">
                    {linkedin && (
                      <a
                        href={linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {calendly && (
                      <a
                        href={calendly}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-white"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Book a call</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Affiliation Form */}
            <div className="bg-white/90 border border-white/80 shadow-xl rounded-3xl p-5 space-y-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Affiliation
              </p>
              <p className="text-xs text-gray-500">
                Mentors need an institution affiliation (university or company).
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "university", label: "University" },
                  { id: "company", label: "Company" },
                ].map((opt) => {
                  const active = affiliationType === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        setAffiliationType(opt.id as typeof affiliationType)
                      }
                      className={`text-xs px-3 py-2 rounded-xl border font-medium transition-all text-center truncate
                        ${
                          active
                            ? `bg-gradient-to-r ${ACCENT_GRADIENT} text-white border-transparent shadow-md`
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-white"
                        }`}
                    >
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {affiliationLabel}
                </label>
                <input
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                  value={affiliationName}
                  onChange={(e) => setAffiliationName(e.target.value)}
                  placeholder={
                    affiliationType === "company"
                      ? "e.g. Google, PwC, local startup"
                      : "e.g. University of Amsterdam"
                  }
                />
              </div>
            </div>

            {/* Education Card */}
            <div className="bg-white/90 border border-white/80 shadow-xl rounded-3xl p-5 space-y-3">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Education (optional)
              </p>

              <input
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. BSc Computer Science"
              />
              <input
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. University of Amsterdam"
              />
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="space-y-8">
            {/* About you */}
            <div className="bg-white/90 border border-white/80 shadow-xl rounded-3xl p-6 space-y-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                About you
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full name
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nathan Mentor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Headline
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. CS Graduate"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    This appears under your name across the app.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Short bio
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[120px] placeholder:text-gray-400"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your background, interests, and how you like to support students."
                />
              </div>
            </div>

            {/* Disciplines & help areas */}
            <div className="bg-white/90 border border-white/80 shadow-xl rounded-3xl p-6 space-y-6">
              {/* Disciplines choice */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Disciplines you can mentor in
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Pick all that genuinely fit you.
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 mb-3">
                  Students searching under these disciplines will be able to
                  discover your profile.
                </p>

                <div className="flex flex-wrap gap-2">
                  {DISCIPLINE_OPTIONS.map((name) => {
                    const active = disciplines.includes(name);
                    const styles = DISCIPLINE_STYLES[name];
                    const light =
                      styles?.light ??
                      "bg-white border-gray-200 text-gray-700";
                    const selectedGradient =
                      styles?.selected ?? "from-blue-300 to-purple-400";

                    return (
                      <motion.button
                        key={name}
                        type="button"
                        whileHover={{ scale: 1.04, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() =>
                          toggle(disciplines, name, setDisciplines)
                        }
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all
                          ${
                            active
                              ? `bg-gradient-to-r ${selectedGradient} text-white border-transparent shadow-md`
                              : `${light} hover:border-blue-300 hover:bg-white`
                          }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {active && <Check className="w-3 h-3" />}
                          {name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Help areas pastel version */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    How you can help
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Choose all that apply.
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {HELP_AREAS.map((area) => {
                    const active = helpAreas.includes(area.id);
                    const styles = HELP_AREA_STYLES[area.id];
                    const selectedGradient =
                      styles?.selected ?? "from-purple-200 to-purple-400";

                    return (
                      <motion.button
                        key={area.id}
                        type="button"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() =>
                          toggle(helpAreas, area.id, setHelpAreas)
                        }
                        className={`text-left px-4 py-3 rounded-2xl border text-xs sm:text-sm transition-shadow relative overflow-hidden
                          ${
                            active
                              ? `bg-gradient-to-br ${selectedGradient} text-gray-900 border-transparent shadow-md`
                              : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:shadow"
                          }`}
                      >
                        {active && (
                          <div className="absolute inset-0 pointer-events-none bg-white/20" />
                        )}
                        <div className="relative">
                          <div className="font-semibold flex items-center gap-2 mb-0.5">
                            {area.label}
                            {active && (
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/40">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[11px] leading-snug ${
                              active ? "text-gray-800" : "text-gray-500"
                            }`}
                          >
                            {area.description}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Extra Details */}
            <div className="bg-white/90 border border-white/80 shadow-xl rounded-3xl p-6 space-y-5">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Extra details
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Languages you can mentor in
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="e.g. English, Dutch, German"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Separate with commas.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Areas of expertise (keywords)
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g. AI, neurology, Oxbridge, Erasmus, IB"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Used for finer search inside each discipline.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Calendly (optional)
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-400"
                    value={calendly}
                    onChange={(e) => setCalendly(e.target.value)}
                    placeholder="https://calendly.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Save button */}
        <div className="flex justify-end mt-8">
          <motion.button
            whileHover={{ scale: saving ? 1 : 1.03, y: saving ? 0 : -1 }}
            whileTap={{ scale: saving ? 1 : 0.97 }}
            disabled={saving}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              const form = e.currentTarget.closest("form");
              if (form) form.requestSubmit();
            }}
            className={`inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r ${ACCENT_GRADIENT} text-white text-sm font-semibold shadow-lg disabled:opacity-60`}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving profile..." : "Save profile & continue"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
