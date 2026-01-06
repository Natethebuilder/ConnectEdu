// client/src/pages/MentorSettings.tsx
import { useState } from "react";
import { useSupabaseAuth } from "../store/supabaseAuth";
import { supabase } from "../lib/supabase";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Upload } from "lucide-react";
import http from "../api/http";
import { isValidEmail } from "../utils/validate";

export default function MentorSettings() {
  const { user, setUser } = useSupabaseAuth();

  if (!user) return <div className="p-6">Please log in.</div>;
  if (user.role !== "mentor") return <Navigate to="/" replace />;

  const navigate = useNavigate();

  const [name, setName] = useState(user.name || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newEmail, setNewEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const mentorAvatar = user.imageUrl;

  async function uploadPhoto() {
    if (!imageFile) return;

    setSaving(true);
    setMsg(null);

    const filePath = `${user.id}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("mentor-avatars")
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      setSaving(false);
      setMsg({ type: "error", text: uploadError.message });
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("mentor-avatars")
      .getPublicUrl(filePath);

    try {
      await http.put("/api/mentors/update-avatar", {
        userId: user.id,
        imageUrl: publicUrl.publicUrl,
      });

      setUser({ ...user, imageUrl: publicUrl.publicUrl });

      setMsg({ type: "success", text: "Photo updated!" });
    } catch {
      setMsg({ type: "error", text: "Failed to update avatar in database." });
    }

    setSaving(false);
  }

  async function changeEmail() {
    if (!newEmail || newEmail === user.email) return;

    if (!isValidEmail(newEmail)) {
      setEmailMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    const domain = newEmail.split("@")[1];

    try {
      const res = await http.get(`/admin/domains/check/${domain}`);
      if (!res.data.allowed) {
        setEmailMsg({ type: "error", text: "Email domain not allowed." });
        return;
      }
    } catch {
      setEmailMsg({ type: "error", text: "Domain check failed." });
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
        text: "We've sent a verification link to your new email.",
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
        text: "Password reset email sent! Please check your inbox.",
      });
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg p-8 rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/40 space-y-8"
      >
        <button
          onClick={() => navigate("/mentor-dashboard")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
        >
          ✕
        </button>

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Mentor Settings
        </h1>

        {/* Avatar */}
        <div className="text-center space-y-4">
          {mentorAvatar ? (
            <img
              src={mentorAvatar}
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow-md mx-auto"
            />
          ) : (
            <div className="w-28 h-28 bg-gray-300 rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
              {user.name?.charAt(0)}
            </div>
          )}

          <label className="cursor-pointer flex items-center gap-2 text-sm bg-gray-100 px-3 py-1 rounded-xl border hover:bg-gray-200 inline-flex">
            <Upload className="w-4 h-4" />
            Choose photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setImageFile(e.target.files?.[0] || null)
              }
            />
          </label>

          {imageFile && (
            <button
              onClick={uploadPhoto}
              className="text-blue-600 underline text-sm"
            >
              Upload photo
            </button>
          )}
        </div>

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

        {/* Name */}
        <div>
          <label className="block mb-1 text-sm font-medium">Name</label>
          <input
            className="w-full border px-3 py-2 rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button
          onClick={async () => {
            setSaving(true);
            const { error } = await supabase.auth.updateUser({
              data: { name },
            });

            if (error) setMsg({ type: "error", text: error.message });
            else {
              setMsg({ type: "success", text: "Name updated!" });
              setUser({ ...user, name });
            }
            setSaving(false);
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={saving}
        >
          {saving ? <Loader2 className="animate-spin" /> : "Save name"}
        </button>

        <hr />

        {/* Email */}
        <div>
          <h2 className="font-semibold">Change Email</h2>

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
            placeholder="New email"
            className="w-full border px-3 py-2 rounded-lg mt-2"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />

          <button
            onClick={changeEmail}
            disabled={emailSaving}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {emailSaving ? <Loader2 className="animate-spin" /> : "Update email"}
          </button>
        </div>

        <hr />

        {/* Password */}
        <div>
          <h2 className="font-semibold">Change Password</h2>

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
            className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pwSaving ? <Loader2 className="animate-spin" /> : "Send reset email"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
