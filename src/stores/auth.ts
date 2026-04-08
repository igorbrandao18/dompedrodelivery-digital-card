"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
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
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  restoreSession: () => Promise<void>;
}

async function authFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.detail || `Erro ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _ready: false,

      requestOtp: async (phone: string) => {
        await authFetch("/auth/otp/request", {
          method: "POST",
          body: JSON.stringify({ phone }),
        });
      },

      verifyOtp: async (phone: string, code: string) => {
        const data = await authFetch<{
          isNewUser: boolean;
          otpToken?: string;
          user?: AuthUser;
          accessToken?: string;
        }>("/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ phone, code }),
        });

        if (!data.isNewUser && data.user) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("dp_auth", "1");
          }
          set({ user: data.user, token: data.accessToken || null });
        }

        return { isNewUser: data.isNewUser, otpToken: data.otpToken };
      },

      completeRegistration: async (
        phone: string,
        otpToken: string,
        name: string
      ) => {
        const data = await authFetch<{ user: AuthUser; accessToken?: string }>(
          "/auth/otp/complete",
          {
            method: "POST",
            body: JSON.stringify({ phone, otpToken, name }),
          }
        );
        if (typeof window !== "undefined") {
          sessionStorage.setItem("dp_auth", "1");
        }
        set({ user: data.user, token: data.accessToken || null });
      },

      logout: async () => {
        try {
          await authFetch("/auth/logout", { method: "POST" });
        } catch {
          // ignore logout errors
        }
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("dp_auth");
        }
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        if (typeof window !== "undefined") {
          return sessionStorage.getItem("dp_auth") === "1";
        }
        return !!get().user;
      },

      restoreSession: async () => {
        if (typeof window === "undefined") {
          set({ _ready: true });
          return;
        }
        const flag = sessionStorage.getItem("dp_auth");
        if (flag !== "1") {
          set({ user: null, token: null, _ready: true });
          return;
        }
        try {
          const data = await authFetch<AuthUser>("/auth/me");
          set({ user: data, _ready: true });
        } catch {
          sessionStorage.removeItem("dp_auth");
          set({ user: null, token: null, _ready: true });
        }
      },
    }),
    {
      name: "dompedro-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
