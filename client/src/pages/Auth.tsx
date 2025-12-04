// client/src/pages/Auth.tsx
import { useState } from "react";
import { useSupabaseAuth } from "../store/supabaseAuth";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import http from "../api/http";

export default function Auth() {
  const { role, setUser } = useSupabaseAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        if (!role) {
          setError("Please select student or mentor before registering.");
          return;
        }

        if (role === "mentor") {
          const domain = email.split("@")[1];

          try {
            const res = await axios.get(
              `${import.meta.env.VITE_API_BASE}/admin/domains/check/${domain}`
            );

            if (!res.data.allowed) {
              setError("This email domain is not allowed for mentor accounts.");
              return;
            }
          } catch {
            setError("Domain check failed. Try again.");
            return;
          }
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } },
        });

        if (error) throw error;

        alert("Check your email for a confirmation link!");
        return;
      }

      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginErr) throw loginErr;

      const { data: fresh } = await supabase.auth.getUser();
      const u = fresh.user;

      if (!u) {
        setError("Login failed. Try again.");
        return;
      }

      let savedRole: "student" | "mentor" | undefined = u.user_metadata?.role;

      if (!savedRole) {
        savedRole = "mentor";

        await supabase.auth.updateUser({
          data: { role: savedRole },
        });

        const ref = await supabase.auth.getUser();
        savedRole = ref.data.user?.user_metadata?.role;
      }

      if (!savedRole) {
        setError("Your account has no assigned role. Contact support.");
        return;
      }

      if (savedRole === "mentor") {
        const domain = u.email!.split("@")[1];

        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE}/admin/domains/check/${domain}`
          );

          if (!res.data.allowed) {
            await supabase.auth.signOut();
            setError("Your email domain is no longer permitted for mentor access.");
            return;
          }
        } catch {
          await supabase.auth.signOut();
          setError("Domain check failed. Try again.");
          return;
        }
      }

      setUser({
        id: u.id,
        email: u.email!,
        name: u.user_metadata?.name,
        role: savedRole,
        avatarSeed: u.user_metadata?.avatarSeed,
      });

      if (savedRole === "student") {
        navigate("/discipline-choice");
        return;
      }

      if (savedRole === "mentor") {
        try {
          await http.get("/api/mentors/me", {
            params: { userId: u.id },
          });

          navigate("/mentor-dashboard");
        } catch {
          navigate("/mentor-onboarding", { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) setError(error.message);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-10 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/40"
      >
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>

        {isRegister && (
          <p className="text-center text-gray-500 mt-1">
            {role ? `Registering as ${role}` : "Choose your role to continue"}
          </p>
        )}

        {error && <p className="text-red-600 text-sm text-center mt-3">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Full name"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg shadow-lg"
          >
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegister ? "Register" : "Login"}
          </motion.button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="px-3 text-sm text-gray-400">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white py-2 rounded-lg hover:bg-gray-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium">Continue with Google</span>
        </motion.button>

        <p className="mt-6 text-sm text-center text-gray-600">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
