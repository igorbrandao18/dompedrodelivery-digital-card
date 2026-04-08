import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock constants before importing apiFetch
vi.mock("@/lib/constants", () => ({
  API_URL: "http://localhost:8000/api",
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

import { apiFetch } from "@/lib/api";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls fetch with correct URL and headers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "ok" }),
    });

    await apiFetch("/test/path");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/test/path",
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it('includes credentials: "include"', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await apiFetch("/anything");

    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.credentials).toBe("include");
  });

  it("throws sanitized error on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: "Unauthorized" }),
    });

    await expect(apiFetch("/secure")).rejects.toThrow(
      "Sessão expirada. Faça login novamente."
    );
  });

  it("returns undefined for 204 responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: () => Promise.resolve(null),
    });

    const result = await apiFetch("/delete-something");
    expect(result).toBeUndefined();
  });

  it("throws generic error when JSON parse fails on error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("parse fail")),
    });

    await expect(apiFetch("/broken")).rejects.toThrow(
      "Erro no servidor. Tente novamente mais tarde."
    );
  });
});
