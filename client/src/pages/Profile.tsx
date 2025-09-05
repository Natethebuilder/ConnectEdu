// client/src/pages/Profile.tsx
import { useState } from "react";
import { useSupabaseAuth } from "../store/supabaseAuth";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";

const getDicebearUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export default function Profile() {
  const { user, setUser } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.from || "/disciplines"; // 👈 fallback

  const [name, setName] = useState(user?.name || "");
  const [avatarSeed, setAvatarSeed] = useState(
    user?.avatarSeed || user?.id || "default"
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!user) return <div className="p-6">Please log in.</div>;

  async function saveProfile() {
    setSaving(true);
    setMsg(null);

    const { data, error } = await supabase.auth.updateUser({
      data: { name, avatarSeed },
    });

    setSaving(false);

    if (error) {
      setMsg({ type: "error", text: error.message });
    } else {
      setMsg({ type: "success", text: "Profile updated!" });
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name,
          role: data.user.user_metadata?.role,
          avatarSeed: data.user.user_metadata?.avatarSeed,
        });
      }
    }
  }

  async function changePassword() {
    setPwSaving(true);
    setPwMsg(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPwSaving(false);

    if (error) {
      setPwMsg({ type: "error", text: error.message });
    } else {
      setPwMsg({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
    }
  }

  const avatarOptions = Array.from({ length: 5 }, (_, i) =>
    getDicebearUrl(`${avatarSeed}-${i}`)
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Floating blobs background */}
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-10 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg p-8 rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/40 space-y-8"
      >
        {/* Close button */}
        <button
          onClick={() => navigate(backTo)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
          aria-label="Close profile"
        >
          ✕
        </button>

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Profile
        </h1>

        {/* Feedback banner */}
        {msg && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              msg.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {msg.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {msg.text}
          </div>
        )}

        {/* Avatar */}
        <div className="text-center space-y-4">
          <img
            src={getDicebearUrl(avatarSeed)}
            alt="avatar"
            className="w-28 h-28 mx-auto rounded-full border-4 border-blue-200 shadow-md"
          />
          <div className="grid grid-cols-5 gap-2 justify-center">
            {avatarOptions.map((url, i) => (
              <button
                key={i}
                onClick={() => setAvatarSeed(`${avatarSeed}-${i}`)}
                className={`rounded-full border-2 p-1 transition ${
                  getDicebearUrl(avatarSeed) === url
                    ? "border-blue-600 scale-110"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img src={url} alt="avatar option" className="w-12 h-12 rounded-full" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
          >
            <RefreshCw className="w-4 h-4" /> Shuffle Avatars
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block mb-1 text-sm font-medium">Name</label>
          <input
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block mb-1 text-sm font-medium">Role</label>
          <p className="text-gray-700 capitalize">{user.role}</p>
        </div>

        {/* Save Profile */}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg shadow-lg hover:opacity-90 transition"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save profile"}
        </button>

        <p className="text-sm text-gray-500 text-center">Email: {user.email}</p>

        <hr className="my-6" />

        {/* Password Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Change Password</h2>
          {pwMsg && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                pwMsg.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {pwMsg.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {pwMsg.text}
            </div>
          )}
          <input
            type="password"
            placeholder="New password"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            onClick={changePassword}
            disabled={pwSaving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg shadow-md hover:opacity-90 transition"
          >
            {pwSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update password"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
