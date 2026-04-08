import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function mockFetchResponse(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("Auth Flow (E2E)", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, _ready: false });
    vi.restoreAllMocks();
  });

  it("starts with unauthenticated and not ready state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state._ready).toBe(false);
    expect(state.isAuthenticated()).toBe(false);
  });

  it("requestOtp calls the correct API endpoint", async () => {
    globalThis.fetch = mockFetchResponse({});
    await useAuthStore.getState().requestOtp("5511999999999");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/otp/request`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ phone: "5511999999999" }),
      })
    );
  });

  it("verifyOtp with existing user sets user and isAuthenticated", async () => {
    const user = { id: "u1", name: "Maria", phone: "5511999999999", role: "customer" };
    globalThis.fetch = mockFetchResponse({ isNewUser: false, user });

    const result = await useAuthStore.getState().verifyOtp("5511999999999", "123456");

    expect(result.isNewUser).toBe(false);
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it("verifyOtp with new user returns isNewUser true and does not set user", async () => {
    globalThis.fetch = mockFetchResponse({ isNewUser: true, otpToken: "tok-abc" });

    const result = await useAuthStore.getState().verifyOtp("5511999999999", "123456");

    expect(result.isNewUser).toBe(true);
    expect(result.otpToken).toBe("tok-abc");
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("completeRegistration sets the user", async () => {
    const user = { id: "u2", name: "Joao", phone: "5511888888888", role: "customer" };
    globalThis.fetch = mockFetchResponse({ user });

    await useAuthStore.getState().completeRegistration("5511888888888", "tok-abc", "Joao");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/otp/complete`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ phone: "5511888888888", otpToken: "tok-abc", name: "Joao" }),
      })
    );
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it("logout clears the user", async () => {
    const user = { id: "u1", name: "Maria", phone: "5511999999999", role: "customer" };
    useAuthStore.setState({ user });

    globalThis.fetch = mockFetchResponse(undefined, 204);

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("restoreSession calls /auth/me and sets user + ready", async () => {
    const user = { id: "u1", name: "Maria", phone: "5511999999999", role: "customer" };
    globalThis.fetch = mockFetchResponse(user);

    await useAuthStore.getState().restoreSession();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${API_URL}/auth/me`,
      expect.objectContaining({
        credentials: "include",
      })
    );
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState()._ready).toBe(true);
  });

  it("restoreSession sets ready even when API fails", async () => {
    globalThis.fetch = mockFetchResponse({ message: "Unauthorized" }, 401);

    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState()._ready).toBe(true);
  });
});
