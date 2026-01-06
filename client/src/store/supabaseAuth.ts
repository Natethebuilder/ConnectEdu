import { create } from "zustand";
import { supabase } from "../lib/supabase";
import http from "../api/http";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: "student" | "mentor";
  imageUrl?: string;
  avatarSeed?: string;
}

interface SupabaseAuthStore {
  user: User | null;
  role: "student" | "mentor" | null;
  ready: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: "student" | "mentor" | null) => void;
  initAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const normalize = (supabaseUser: any): User | null => {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name,
    role: supabaseUser.user_metadata?.role,
    avatarSeed: supabaseUser.user_metadata?.avatarSeed,
  };
};

export const useSupabaseAuth = create<SupabaseAuthStore>((set) => ({
  user: null,
  role: null,
  ready: false,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),

  initAuth: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Session error:", error);
        set({ ready: true });
        return;
      }

      const u = normalize(data.session?.user ?? null);
      
      // Don't fetch mentor profile here - let pages handle it when needed
      // This prevents loops and race conditions
      set({
        user: u ?? null,
        role: (u?.role as any) ?? null,
        ready: true,
      });
    } catch (err) {
      console.error("❌ initAuth error:", err);
      set({ ready: true });
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, role: null });
      console.log("✅ Logged out");
    } catch (err) {
      console.error("❌ Logout error:", err);
    }
  },
}));

// Sync with Supabase auth changes
supabase.auth.onAuthStateChange(async (_event, session) => {
  const u = normalize(session?.user ?? null);
  
  // Don't try to fetch mentor profile on state change - let the login flow handle it
  // This prevents race conditions and 404 errors from blocking the UI
  useSupabaseAuth.setState({
    user: u ?? null,
    role: (u?.role as any) ?? null,
  });
});
