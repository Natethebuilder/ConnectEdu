// client/src/pages/Profile.tsx
import { useState } from "react";
import { useSupabaseAuth } from "../store/supabaseAuth";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { isValidEmail } from "../utils/validate";

const getDicebearUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export default function Profile() {
  const { user, setUser } = useSupabaseAuth();

  // mentors should use mentor settings instead
  if (user?.role === "mentor") return <Navigate to="/mentor-settings" replace />;

  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.from || "/disciplines";

  const [name, setName] = useState(user?.name || "");
  const [avatarSeed, setAvatarSeed] = useState(
    user?.avatarSeed || user?.id || "default"
  );
  const [newEmail, setNewEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  async function changeEmail() {
    if (!newEmail || newEmail === user.email) return;

    if (!isValidEmail(newEmail)) {
      setEmailMsg({ type: "error", text: "Please enter a valid email." });
      return;
    }

    setEmailSaving(true);
    setEmailMsg(null);

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    setEmailSaving(false);

    if (error) {
      setEmailMsg({ type: "error", text: error.message });
    } else {
      setEmailMsg({
        type: "success",
        text: "Verification link sent to your new email.",
      });
      setNewEmail("");
    }
  }

  async function sendPasswordReset() {
    setPwSaving(true);
    setPwMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
      redirectTo: `${window.location.origin}/auth/v1/callback`,
    });

    setPwSaving(false);

    if (error) {
      setPwMsg({ type: "error", text: error.message });
    } else {
      setPwMsg({
        type: "success",
        text: "Password reset email sent! Check your inbox.",
      });
    }
  }

  const avatarOptions = Array.from({ length: 5 }, (_, i) =>
    getDicebearUrl(`${avatarSeed}-${i}`)
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg p-8 rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/40 space-y-8"
      >
        <button
          onClick={() => navigate(backTo)}
          className="absolute top-4 right-4 text-lg text-gray-600"
        >
          ✕
        </button>

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Profile
        </h1>

        {msg && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              msg.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {msg.type === "success" ? <CheckCircle /> : <XCircle />}
            {msg.text}
          </div>
        )}

        <div className="text-center space-y-4">
          <img
            src={getDicebearUrl(avatarSeed)}
            className="w-28 h-28 rounded-full mx-auto border-4 border-blue-200 shadow-md"
          />

          <div className="grid grid-cols-5 gap-2">
            {avatarOptions.map((url, i) => (
              <button
                key={i}
                onClick={() => setAvatarSeed(`${avatarSeed}-${i}`)}
                className={`rounded-full border-2 p-1 ${
                  getDicebearUrl(avatarSeed) === url
                    ? "border-blue-600 scale-110"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img src={url} className="w-12 h-12 rounded-full" />
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setAvatarSeed(Math.random().toString(36).substring(7))
            }
            className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Shuffle
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block mb-1 text-sm">Name</label>
          <input
            className="w-full border px-3 py-2 rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <p className="text-sm text-gray-500 text-center">Email: {user.email}</p>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="animate-spin" /> : "Save profile"}
        </button>

        <hr />

        {/* Email */}
        <div>
          <h2 className="text-lg font-semibold">Change Email</h2>

          {emailMsg && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                emailMsg.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {emailMsg.type === "success" ? <CheckCircle /> : <XCircle />}
              {emailMsg.text}
            </div>
          )}

          <input
            type="email"
            className="w-full border px-3 py-2 rounded-lg mt-2"
            placeholder="New email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <button
            onClick={changeEmail}
            disabled={emailSaving}
            className="w-full mt-2 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {emailSaving ? <Loader2 className="animate-spin" /> : "Update email"}
          </button>
        </div>

        <hr />

        {/* Password */}
        <div>
          <h2 className="text-lg font-semibold">Change Password</h2>

          {pwMsg && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                pwMsg.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {pwMsg.type === "success" ? <CheckCircle /> : <XCircle />}
              {pwMsg.text}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            We’ll send a secure link to your email where you can choose a new
            password.
          </p>

          <button
            onClick={sendPasswordReset}
            disabled={pwSaving}
            className="w-full mt-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pwSaving ? (
              <Loader2 className="animate-spin inline-block w-4 h-4" />
            ) : (
              "Send reset email"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
