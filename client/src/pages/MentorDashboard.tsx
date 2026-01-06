import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import http from "../api/http";
import { useSupabaseAuth } from "../store/supabaseAuth";

type MentorProfile = {
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
};

export default function MentorDashboard() {
  const { user, role, ready, setUser } = useSupabaseAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (loading && profile) return; // Already loaded, don't fetch again

    if (!user) {
        navigate("/login");
        return;
    }

    if (role !== "mentor") {
        navigate("/discipline-choice");
        return;
    }

    // Only fetch if we don't have a profile yet
    if (profile) {
      setLoading(false);
      return;
    }

    // 🚨 Check MongoDB profile on page load (only once)
    http.get("/api/mentors/me")
        .then((res) => {
        setProfile(res.data);
        // Only update user if imageUrl changed
        if (res.data.imageUrl && res.data.imageUrl !== user.imageUrl) {
          setUser({
            ...user,
            imageUrl: res.data.imageUrl,
          });
        }
        setLoading(false);
        })
        .catch(err => {
          console.error("Mentor profile fetch failed:", err);
          setLoading(false);
          navigate("/mentor-onboarding");
        });

    // Remove setUser from dependencies - it's stable and causes infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, user?.id, role, navigate]);


  if (!ready || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-600">
        Loading mentor dashboard...
      </div>
    );
  }

  if (!profile) {
    // In theory we already redirected if no profile.
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
              Welcome back, {profile.name.split(" ")[0]}
            </h1>
            <p className="text-gray-500 mt-2 max-w-xl text-sm sm:text-base">
              This is your mentor space. Here you’ll soon see students matched
              with you, messages, and tools to help you guide them effectively.
            </p>
          </div>

          <button
            onClick={() => navigate("/mentor-onboarding")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-white/80 border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:bg-white"
          >
            Edit profile
          </button>
        </div>

        {/* Profile overview card */}
        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          <div className="bg-white/80 border border-white/70 shadow-xl rounded-3xl p-6 flex flex-col items-center">
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center border-4 border-white shadow-md text-2xl font-semibold text-gray-700">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="mt-4 text-lg font-bold text-gray-800 text-center">
              {profile.name}
            </h2>
            {profile.headline && (
              <p className="mt-1 text-sm text-gray-500 text-center">
                {profile.headline}
              </p>
            )}
            {profile.university && (
              <p className="mt-3 text-xs text-gray-400 text-center">
                {profile.degree ? `${profile.degree}, ` : ""}
                {profile.university}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 border border-white/70 shadow-xl rounded-3xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                About you
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {profile.bio || "No bio added yet."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-white/80 border border-white/70 shadow-xl rounded-3xl p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Areas of expertise
                </h3>
                {profile.expertise && profile.expertise.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    No areas of expertise added yet.
                  </p>
                )}
              </div>

              <div className="bg-white/80 border border-white/70 shadow-xl rounded-3xl p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Languages
                </h3>
                {profile.languages && profile.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    No languages added yet.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white/80 border border-white/70 shadow-xl rounded-3xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Links
              </h3>
              <div className="flex flex-wrap gap-4 text-sm">
                {profile.linkedin ? (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    LinkedIn profile
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">
                    No LinkedIn added yet.
                  </span>
                )}

                {profile.calendly && (
                  <a
                    href={profile.calendly}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 underline"
                  >
                    Calendly
                  </a>
                )}
              </div>
            </div>
            {/* Messages inbox card */}
            <div className="bg-white/80 border border-white/70 shadow-xl rounded-3xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Messages</h3>

              <p className="text-sm text-gray-500 mb-4">
                View and reply to your student conversations.
              </p>

              <button
                onClick={() => navigate("/messages")}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm shadow hover:bg-purple-700 transition"
              >
                Open Messages Inbox
              </button>
            </div>

            {/* Future: stats, messages, etc. */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold mb-2">
                What’s coming next
              </h3>
              <p className="text-sm text-blue-50">
                Soon you’ll be able to see students matched with you, manage
                conversations, and share resources — all from this dashboard.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
