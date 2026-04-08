import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("security regression tests", () => {
  const storesDir = resolve(__dirname, "../stores");

  describe("auth store", () => {
    const authSource = readFileSync(resolve(storesDir, "auth.ts"), "utf-8");

    it("does NOT use localStorage persistence (no persist import)", () => {
      expect(authSource).not.toMatch(/import.*persist/);
      expect(authSource).not.toContain("persist(");
    });

    it("does not expose a token field in state", () => {
      // The store should rely on httpOnly cookies, not client-side tokens
      expect(authSource).not.toMatch(/^\s+token\s*:/m);
      expect(authSource).not.toMatch(/accessToken/);
      expect(authSource).not.toMatch(/refreshToken/);
    });
  });

  describe("cart store", () => {
    const cartSource = readFileSync(resolve(storesDir, "cart.ts"), "utf-8");

    it("does NOT use localStorage persistence (no persist import)", () => {
      expect(cartSource).not.toMatch(/import.*persist/);
      expect(cartSource).not.toContain("persist(");
    });

    it("caps quantity at 99", () => {
      // Both addItem and setQuantity should enforce Math.min(99, ...)
      const matches = cartSource.match(/Math\.min\(99/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("slug validation regex", () => {
    const VALID_SLUG = /^[a-z0-9-]+$/;

    it("accepts valid slugs", () => {
      expect(VALID_SLUG.test("minha-loja")).toBe(true);
      expect(VALID_SLUG.test("burguer-do-igor")).toBe(true);
      expect(VALID_SLUG.test("loja123")).toBe(true);
      expect(VALID_SLUG.test("a")).toBe(true);
    });

    it("rejects invalid slugs", () => {
      expect(VALID_SLUG.test("")).toBe(false);
      expect(VALID_SLUG.test("UPPERCASE")).toBe(false);
      expect(VALID_SLUG.test("has spaces")).toBe(false);
      expect(VALID_SLUG.test("special!@#")).toBe(false);
      expect(VALID_SLUG.test("../path-traversal")).toBe(false);
      expect(VALID_SLUG.test("under_score")).toBe(false);
    });
  });
});
