// client/src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function process() {
      // Read params from hash fragment (Supabase password reset format)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");

      // If we have hash-based tokens (password reset flow)
      if (access_token && refresh_token) {
        if (type === "recovery") {
          // Set the session and redirect to password reset page
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          if (error) {
            console.error("Session error:", error);
            navigate("/login?error=invalid_token");
            return;
          }
          
          navigate("/auth/reset", { replace: true });
          return;
        }
      }

      // Try code-based exchange (for email confirmation, etc.)
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (error) {
          console.warn("Exchange code failed:", error);
          // Fall through to check query/hash params
        } else if (data?.session) {
          // Successfully exchanged code, now check what type of callback
          const url = new URL(window.location.href);
          const queryType = url.searchParams.get("type");
          const hashType = hashParams.get("type");
          const type = hashType || queryType;

          if (type === "email_confirmation" || type === "email_change" || type === "signup") {
            navigate("/email-confirmed");
            return;
          }
        }
      } catch (err) {
        console.warn("Exchange code failed:", err);
      }

      // Check query params as fallback
      const url = new URL(window.location.href);
      const queryType = url.searchParams.get("type");
      const hashType = hashParams.get("type");
      const type = hashType || queryType;

      if (type === "recovery" || (access_token && refresh_token)) {
        navigate("/auth/reset", { replace: true });
        return;
      }

      if (type === "email_confirmation" || type === "email_change" || type === "signup") {
        navigate("/email-confirmed");
        return;
      }

      // Default fallback → home
      navigate("/", { replace: true });
    }

    process();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen text-gray-600">
      Processing authentication…
    </div>
  );
}
