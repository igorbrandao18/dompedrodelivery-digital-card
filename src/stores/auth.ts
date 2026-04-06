"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  _ready: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  getMe: () => Promise<AuthUser>;
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

      login: async (email: string, password: string) => {
        const data = await authFetch<{ user: AuthUser; token?: string }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );
        if (typeof window !== "undefined") {
          sessionStorage.setItem("dp_auth", "1");
        }
        set({ user: data.user, token: data.token || null });
      },

      register: async (
        name: string,
        email: string,
        password: string,
        phone: string
      ) => {
        const data = await authFetch<{ user: AuthUser; token?: string }>(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify({ name, email, password, phone }),
          }
        );
        if (typeof window !== "undefined") {
          sessionStorage.setItem("dp_auth", "1");
        }
        set({ user: data.user, token: data.token || null });
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

      getMe: async () => {
        const data = await authFetch<AuthUser>("/auth/me");
        set({ user: data });
        return data;
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
