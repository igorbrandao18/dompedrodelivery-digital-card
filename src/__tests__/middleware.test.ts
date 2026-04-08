import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");

  const MockNextResponse = function (body?: string, init?: ResponseInit) {
    return new Response(body, init);
  } as unknown as typeof import("next/server").NextResponse;

  (MockNextResponse as Record<string, unknown>).next = vi.fn(() => ({
    type: "next",
  }));
  (MockNextResponse as Record<string, unknown>).rewrite = vi.fn((url: URL) => ({
    type: "rewrite",
    url,
  }));

  return { ...actual, NextResponse: MockNextResponse };
});

// Import after mock is set up
import { NextResponse } from "next/server";
import { middleware } from "@/middleware";

const createRequest = (url: string, host: string) => {
  const nextUrl = Object.assign(new URL(url), {
    clone() {
      return new URL(nextUrl.href);
    },
  });
  return {
    headers: { get: (key: string) => (key === "host" ? host : null) },
    nextUrl,
  } as unknown as NextRequest;
};

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rewrites URL correctly for a valid slug in subdomain", () => {
    const req = createRequest(
      "https://burguer-do-igor.dompedrodelivery.com.br/",
      "burguer-do-igor.dompedrodelivery.com.br"
    );

    const result = middleware(req);

    expect(result).toBeDefined();
    expect(NextResponse.rewrite).toHaveBeenCalled();
    const rewriteUrl = (NextResponse.rewrite as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as URL;
    expect(rewriteUrl.pathname).toBe("/burguer-do-igor");
  });

  it("returns 400 for an invalid slug with special characters in subdomain", () => {
    const req = createRequest(
      "https://burg%C3%BCer!.dompedrodelivery.com.br/",
      "burg\u00FCer!.dompedrodelivery.com.br"
    );

    const result = middleware(req);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(400);
  });

  it("passes through for localhost with no query param", () => {
    const req = createRequest("http://localhost:3000/", "localhost:3000");

    middleware(req);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it("rewrites correctly when ?slug= query param has a valid slug", () => {
    const req = createRequest(
      "http://localhost:3000/?slug=minha-loja",
      "localhost:3000"
    );

    middleware(req);

    expect(NextResponse.rewrite).toHaveBeenCalled();
    const rewriteUrl = (NextResponse.rewrite as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as URL;
    expect(rewriteUrl.pathname).toBe("/minha-loja");
    expect(rewriteUrl.searchParams.has("slug")).toBe(false);
  });

  it("returns 400 when ?slug= query param has an invalid slug", () => {
    const req = createRequest(
      "http://localhost:3000/?slug=INVALID_SLUG!",
      "localhost:3000"
    );

    const result = middleware(req);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(400);
  });

  it("passes through when there is no subdomain and no query param", () => {
    const req = createRequest(
      "https://dompedrodelivery.com.br/",
      "dompedrodelivery.com.br"
    );

    middleware(req);

    expect(NextResponse.next).toHaveBeenCalled();
  });
});
