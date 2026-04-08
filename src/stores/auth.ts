"use client";

import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
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

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
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
    }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });

    if (!data.isNewUser && data.user) {
      set({ user: data.user });
    }

    return { isNewUser: data.isNewUser, otpToken: data.otpToken };
  },

  completeRegistration: async (
    phone: string,
    otpToken: string,
    name: string
  ) => {
    const data = await authFetch<{ user: AuthUser }>(
      "/auth/otp/complete",
      {
        method: "POST",
        body: JSON.stringify({ phone, otpToken, name }),
      }
    );
    set({ user: data.user });
  },

  logout: async () => {
    try {
      await authFetch("/auth/logout", { method: "POST" });
    } catch {
      // ignore logout errors
    }
    set({ user: null });
  },

  isAuthenticated: () => {
    return get().user !== null;
  },

  restoreSession: async () => {
    if (typeof window === "undefined") {
      set({ _ready: true });
      return;
    }
    try {
      const data = await authFetch<AuthUser>("/auth/me");
      set({ user: data, _ready: true });
    } catch {
      set({ user: null, _ready: true });
    }
  },
}));
