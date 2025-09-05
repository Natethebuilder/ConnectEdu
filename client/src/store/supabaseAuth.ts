import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { User as SupaUser } from "@supabase/supabase-js";

type AppUser = {
  id: string;
  email: string;
  name?: string;
  role?: "student" | "alumni";
  avatarSeed?: string; // ✅ add this
} | null;

function normalize(user?: SupaUser | null): AppUser {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.name,
    role: user.user_metadata?.role,
    avatarSeed: user.user_metadata?.avatarSeed, // ✅ normalize it
  };
}

type AuthState = {
  user: AppUser;
  role: "student" | "alumni" | null;
  ready: boolean;
  setUser: (u: AppUser) => void;
  setRole: (r: "student" | "alumni" | null) => void;
  initAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useSupabaseAuth = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  ready: false,
  setUser: (u) => set({ user: u, role: (u?.role as any) ?? get().role }),
  setRole: (r) => set({ role: r }),
  initAuth: async () => {
    const { data } = await supabase.auth.getSession();
    const u = normalize(data.session?.user ?? null);
    set({ user: u, role: (u?.role as any) ?? null, ready: true });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },
}));

// keep in sync with supabase
supabase.auth.onAuthStateChange((_event, session) => {
  const u = normalize(session?.user ?? null);
  useSupabaseAuth.setState({
    user: u,
    role: (u?.role as any) ?? null,
  });
});
