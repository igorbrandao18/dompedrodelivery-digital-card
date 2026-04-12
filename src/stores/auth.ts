"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch, setAuthToken } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  _ready: boolean;

  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (
    phone: string,
    code: string
  ) => Promise<{ isNewUser: boolean; otpToken?: string }>;
  completeRegistration: (
    phone: string,
    otpToken: string,
    name: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      _ready: false,

      requestOtp: async (phone: string) => {
        await apiFetch("/auth/otp/request", {
          method: "POST",
          body: JSON.stringify({ phone }),
        });
      },

      verifyOtp: async (phone: string, code: string) => {
        const data = await apiFetch<{
          isNewUser: boolean;
          otpToken?: string;
          user?: AuthUser;
          accessToken?: string;
          refreshToken?: string;
        }>("/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ phone, code }),
        });

        if (!data.isNewUser && data.user) {
          set({ user: data.user });
          if (data.accessToken) {
            set({ accessToken: data.accessToken, refreshToken: data.refreshToken || null });
            setAuthToken(data.accessToken);
          }
        }

        return { isNewUser: data.isNewUser, otpToken: data.otpToken };
      },

      completeRegistration: async (
        phone: string,
        otpToken: string,
        name: string
      ) => {
        const data = await apiFetch<{
          user: AuthUser;
          accessToken?: string;
          refreshToken?: string;
        }>("/auth/otp/complete", {
          method: "POST",
          body: JSON.stringify({ phone, otpToken, name }),
        });
        set({ user: data.user });
        if (data.accessToken) {
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken || null });
          setAuthToken(data.accessToken);
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        setAuthToken(null);
      },

      isAuthenticated: () => {
        return get().user !== null && get().accessToken !== null;
      },

      restoreSession: async () => {
        if (typeof window === "undefined") {
          set({ _ready: true });
          return;
        }
        const token = get().accessToken;
        if (!token) {
          set({ user: null, _ready: true });
          return;
        }
        setAuthToken(token);
        try {
          const data = await apiFetch<AuthUser>("/auth/me");
          set({ user: data, _ready: true });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, _ready: true });
          setAuthToken(null);
        }
      },
    }),
    {
      name: "dompedro-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
