import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function PasswordReset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Read params from hash fragment (Supabase format)
    const hash = new URLSearchParams(window.location.hash.substring(1));
    const type = hash.get("type");
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");

    if (type === "recovery" && access_token && refresh_token) {
      // Restore Supabase session so user can change password
      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(({ error }) => {
          if (error) setError(error.message);
          setReady(true);
        });
    } else {
      setError("Invalid or expired password reset link.");
    }
  }, []);

  async function handleReset() {
    if (!password) return;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      navigate("/login?reset=success");
    }
  }

  if (!ready && !error) {
    return <div>Loading reset page…</div>;
  }

  return (
    <div className="flex flex-col items-center p-10">
      <h2 className="text-2xl font-bold mb-4">Choose a new password</h2>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded mb-4 w-80"
      />

      <button
        onClick={handleReset}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Reset Password
      </button>
    </div>
  );
}
