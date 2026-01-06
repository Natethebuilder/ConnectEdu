// client/src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function process() {
      // Supabase: exchange auth code for local session
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (err) {
        console.warn("Exchange code failed:", err);
      }

    const url = new URL(window.location.href);

        // Query type
    const queryType = url.searchParams.get("type");

        // Hash params type
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashType = hashParams.get("type");

        // Combined type
    const type = hashType || queryType;

        // If a recovery token exists but no type param, treat as recovery
    const hasAccessToken = window.location.hash.includes("access_token");

    if (type === "recovery" || hasAccessToken) {
        navigate("/auth/reset", { replace: true });
        return;
    }


      // If access_token exists but no type → it's also a reset
      if (window.location.hash.includes("access_token")) {
        navigate("/auth/reset", { replace: true });
        return;
      }

      if (
        type === "email_confirmation" ||
        type === "email_change" ||
        type === "signup"
      ) {
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
