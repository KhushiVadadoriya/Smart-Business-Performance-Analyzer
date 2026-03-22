import { create } from "zustand";
import type { UserProfile } from "../api/auth";

type AuthState = {
  token: string | null;
  userEmail: string | null;
  user: UserProfile | null;
  setSession: (params: { token: string; userEmail?: string; user?: UserProfile | null }) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userEmail: null,
  user: null,
  setSession: ({ token, userEmail, user }) =>
    set((state) => ({
      token,
      userEmail: userEmail ?? user?.email ?? state.userEmail,
      user: user ?? state.user,
    })),
  setUser: (user) => set({ user, userEmail: user?.email ?? null }),
  logout: () => set({ token: null, userEmail: null, user: null }),
}));

