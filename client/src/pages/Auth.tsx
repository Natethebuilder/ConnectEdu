// client/src/pages/Auth.tsx
import { useState, useEffect } from "react";
import { useSupabaseAuth } from "../store/supabaseAuth";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import http from "../api/http";

export default function Auth() {
  const { role, setUser, setRole, ready } = useSupabaseAuth(); // add ready
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Wait until auth store is ready before redirecting
  // Only redirect if we're not in the middle of a login/register flow
  useEffect(() => {
    if (!ready) return;
    // Don't redirect if we're submitting (in the middle of login)
    if (submitting) return;
    if (role === null) {
      navigate("/login", { replace: true });
    }
  }, [ready, role, navigate, submitting]);

  // -------------------------------------------------------------
  // HANDLE PASSWORD RESET (ADDED)
  // -------------------------------------------------------------
  async function handleForgotPassword() {
    setError("");

    if (!email) {
      setError("Enter your email first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/v1/callback`,
    });

    if (error) {
      setError(error.message);
      return;
    }

    alert("Check your email for a password reset link!");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Safety timeout - if we're still submitting after 15 seconds, reset it
    let safetyTimeout: NodeJS.Timeout | null = setTimeout(() => {
      console.error("Auth: Safety timeout triggered - login took too long");
      setSubmitting(false);
      setError("Login is taking longer than expected. Please try again.");
    }, 15000);

    try {
      if (isRegister) {
        if (!role) {
          setError("Please select student or mentor before registering.");
          return;
        }

        if (role === "mentor") {
          try {
            // Check the full email, not just the domain
            const res = await http.get(`/admin/domains/check/${encodeURIComponent(email)}`);
            if (!res.data.allowed) {
              setError("This email is not allowed for mentor accounts.");
              return;
            }
          } catch {
            setError("Email check failed. Try again.");
            return;
          }
        }

        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } },
        });

        if (signUpErr) throw signUpErr;

        alert("Check your email for a confirmation link!");
        return;
      }

      // -------------------------
      // LOGIN
      // -------------------------
      console.log("Auth: submitting login for", email);
      console.log("Auth: API Base URL:", import.meta.env.VITE_API_BASE || "NOT SET");
      const { data, error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginErr) throw loginErr;
      console.log("Auth: signIn response", data);

      const u = data.user;
      if (!u) {
        setSubmitting(false);
        setError("Login failed. Try again.");
        return;
      }

      console.log("Auth: User logged in", u.email, "Role:", u.user_metadata?.role);

      let savedRole: "student" | "mentor" | undefined = u.user_metadata?.role;

      if (!savedRole) {
        console.log("Auth: No role found, defaulting to mentor");
        savedRole = "mentor";
        await supabase.auth.updateUser({ data: { role: savedRole } });
      }

      // Check if user selected a different role than their saved role
      // If they selected "mentor" but their account is "student", show error
      if (role === "mentor" && savedRole === "student") {
        console.log("Auth: User selected mentor but account is student");
        setSubmitting(false);
        setError("This is a student account. Please log in as a student instead.");
        return;
      }

      // If they selected "student" but their account is "mentor", show error
      if (role === "student" && savedRole === "mentor") {
        console.log("Auth: User selected student but account is mentor");
        setSubmitting(false);
        setError("This is a mentor account. Please log in as a mentor instead.");
        return;
      }

      console.log("Auth: Proceeding with role:", savedRole);

      // Mentor email check with timeout to avoid hanging
      // NOTE: Made non-blocking - if it fails, we log a warning but continue with login
      if (savedRole === "mentor") {
        const userEmail = u.email!;
        console.log("Auth: checking mentor email", userEmail);

        let timeoutId: NodeJS.Timeout | null = null;
        let emailCheckPassed = false;
        
        try {
          // Use AbortController for proper timeout handling - shorter timeout
          const controller = new AbortController();
          timeoutId = setTimeout(() => {
            console.warn("Auth: Email check timeout - continuing with login anyway");
            controller.abort();
          }, 3000); // Reduced to 3 seconds
          
          console.log("Auth: Making email check request to:", `/admin/domains/check/${encodeURIComponent(userEmail)}`);
          const res = await http.get(`/admin/domains/check/${encodeURIComponent(userEmail)}`, {
            signal: controller.signal
          });
          
          if (timeoutId) clearTimeout(timeoutId);
          console.log("Auth: email check result", res.data);
          if (!res.data.allowed) {
            // Only block if email is explicitly not allowed
            console.error("Auth: Email not allowed for mentor access:", userEmail);
            setSubmitting(false);
            setError("Your email is not permitted for mentor access. Please contact support.");
            // Don't sign out - just show error and let them try again or go back
            return;
          }
          emailCheckPassed = true;
          console.log("Auth: Email check passed");
        } catch (err: any) {
          if (timeoutId) clearTimeout(timeoutId);
          console.warn("Auth: email check failed or timed out - continuing with login anyway", {
            code: err?.code,
            name: err?.name,
            message: err?.message,
            response: err?.response?.status,
          });
          // Don't block login if email check fails - just log a warning
          // The server will validate on actual mentor operations if needed
        }
        
        if (!emailCheckPassed) {
          console.warn("Auth: Email check did not complete successfully, but continuing with login");
        }
      }

      // set user in local store
      console.log("Auth: Setting user in store");
      setUser({
        id: u.id,
        email: u.email!,
        name: u.user_metadata?.name,
        role: savedRole,
        avatarSeed: u.user_metadata?.avatarSeed,
      });
      // Also update the role in the store separately
      setRole(savedRole);

      // if mentor -> check profile quickly with timeout (so UI won't hang)
      if (savedRole === "mentor") {
        let timeoutId: NodeJS.Timeout | null = null;
        let shouldNavigate = true;
        let targetRoute = "/mentor-onboarding"; // Default to onboarding
        
        try {
          console.log("🔍 Checking mentor profile...");
          
          // Use AbortController for proper timeout handling
          const controller = new AbortController();
          timeoutId = setTimeout(() => {
            console.log("Auth: Mentor profile check timeout triggered");
            controller.abort();
          }, 5000);
          
          console.log("Auth: Making mentor profile request...");
          const res = await http.get("/api/mentors/me", {
            signal: controller.signal
          });
          
          if (timeoutId) clearTimeout(timeoutId);
          console.log("✅ Mentor profile found, redirecting to dashboard");
          targetRoute = "/mentor-dashboard";
        } catch (err: any) {
          if (timeoutId) clearTimeout(timeoutId);
          console.error("❌ Mentor lookup failed:", err);
          console.error("Auth: Error details:", {
            code: err?.code,
            name: err?.name,
            message: err?.message,
            response: err?.response?.status,
            data: err?.response?.data,
          });
          
          // Check if it's an abort (timeout) or 404 (profile not found)
          const isTimeout = err?.code === 'ERR_CANCELED' || err?.name === 'AbortError' || err?.message?.includes("timeout") || err?.message?.includes("aborted");
          const isNotFound = err?.response?.status === 404;
          
          console.log("Auth: isTimeout:", isTimeout, "isNotFound:", isNotFound);
          
          if (isNotFound || isTimeout) {
            console.log("→ Profile not found or timeout, redirecting to onboarding");
            targetRoute = "/mentor-onboarding";
          } else if (err?.response?.status === 401) {
            // For 401 (auth errors), sign out and redirect to login
            console.error("→ Auth error during mentor profile check");
            await supabase.auth.signOut();
            setSubmitting(false);
            setError("Authentication failed. Please log in again.");
            targetRoute = "/login";
          } else {
            // For other errors, still go to onboarding (safer than blocking)
            console.error("→ Unexpected error during mentor profile check, going to onboarding anyway");
            targetRoute = "/mentor-onboarding";
          }
        } finally {
          // Always navigate, regardless of success or failure
          if (shouldNavigate) {
            console.log("Auth: Navigating to:", targetRoute);
            setSubmitting(false);
            // Use React Router navigate to maintain state
            navigate(targetRoute, { replace: true });
          }
        }
        
        return; // Exit early since we're navigating
      }

      // student route
      if (savedRole === "student") {
        console.log("Auth: Student login, redirecting to discipline choice");
        setSubmitting(false);
        navigate("/discipline-choice", { replace: true });
        return;
      }
      
      // Fallback - should never reach here, but just in case
      console.warn("Auth: Unexpected state, no role matched");
      setSubmitting(false);
    } catch (err: any) {
      console.error("Auth error:", err);
      console.error("Auth: Full error object:", err);
      setError(err?.message || "Something went wrong.");
    } finally {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
        safetyTimeout = null;
      }
      setSubmitting(false);
      console.log("Auth: Finally block executed, submitting reset");
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating blobs */}
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

      {/* Auth Card */}
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
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: submitting ? 1 : 0.97 }}
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg shadow-lg disabled:opacity-70"
          >
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {submitting
              ? isRegister
                ? "Creating account..."
                : "Logging in..."
              : isRegister
              ? "Register"
              : "Login"}
          </motion.button>

          {/* ------------------------------------------------------------- */}
          {/* FORGOT PASSWORD (ADDED) */}
          {/* ------------------------------------------------------------- */}
          {!isRegister && (
            <p className="text-center mt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 underline text-sm"
              >
                Forgot password?
              </button>
            </p>
          )}
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
