import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth";

// Mock apiFetch
vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/lib/api";
const mockApiFetch = vi.mocked(apiFetch);

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, _ready: false });
    vi.clearAllMocks();
  });

  it("initial state: user is null and _ready is false", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state._ready).toBe(false);
  });

  it("isAuthenticated: returns false when no user", () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("isAuthenticated: returns true when user is set", () => {
    useAuthStore.setState({
      user: { id: "u1", name: "João", phone: "1199999", role: "customer" },
    });
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it("restoreSession: sets _ready to true after call", async () => {
    mockApiFetch.mockResolvedValueOnce({
      id: "u1",
      name: "João",
      phone: "1199999",
      role: "customer",
    });

    await useAuthStore.getState().restoreSession();

    const state = useAuthStore.getState();
    expect(state._ready).toBe(true);
    expect(state.user).toEqual({
      id: "u1",
      name: "João",
      phone: "1199999",
      role: "customer",
    });
  });

  it("restoreSession: sets _ready true even on error", async () => {
    mockApiFetch.mockRejectedValueOnce(new Error("network error"));

    await useAuthStore.getState().restoreSession();

    const state = useAuthStore.getState();
    expect(state._ready).toBe(true);
    expect(state.user).toBeNull();
  });

  it("logout: clears user", async () => {
    useAuthStore.setState({
      user: { id: "u1", name: "João", phone: "1199999", role: "customer" },
    });
    mockApiFetch.mockResolvedValueOnce(undefined);

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
  });

  it("logout: clears user even if API call fails", async () => {
    useAuthStore.setState({
      user: { id: "u1", name: "João", phone: "1199999", role: "customer" },
    });
    mockApiFetch.mockRejectedValueOnce(new Error("fail"));

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
  });
});
