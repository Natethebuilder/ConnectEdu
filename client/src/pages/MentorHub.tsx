import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import http from "../api/http";
import MentorShowcaseCard from "../components/MentorShowcaseCard";
import { titleCase } from "../utils/format";

export default function MentorHub() {
  const { discipline } = useParams();
  const [mentors, setMentors] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    http
      .get(`/api/mentors/by-discipline/${discipline}`)
      .then((res) => setMentors(res.data || []))
      .catch(console.error);
  }, [discipline]);

  const filtered = mentors.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen px-6 py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Background blobs */}
      <motion.div
        animate={{ y: [0, 40, 0], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="pointer-events-none absolute top-24 left-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -40, 0], opacity: [0.25, 0.6, 0.25] }}
        transition={{ duration: 17, repeat: Infinity }}
        className="pointer-events-none absolute bottom-24 right-14 w-[26rem] h-[26rem] bg-purple-400 rounded-full mix-blend-multiply blur-3xl opacity-30"
      />

      {/* HEADER */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-gray-200 shadow-sm mb-3">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Mentor Hub
          </span>
        </div>

        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
          {titleCase(discipline || "")} Mentors
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Find experienced mentors, book calls, or chat directly for guidance.
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-lg mx-auto bg-white/80 backdrop-blur border border-gray-200 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 mb-16">
        <Search className="text-gray-400" />
        <input
          type="text"
          placeholder="Search mentors..."
          className="flex-1 bg-transparent outline-none text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* GRID */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
      >
        {filtered.map((mentor, i) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
          >
            <MentorShowcaseCard mentor={mentor} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
