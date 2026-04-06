import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const host = hostname.split(":")[0];

  // Extract slug from subdomain: burguer-do-igor.dompedrodelivery.com.br → burguer-do-igor
  let slug = host.replace(".dompedrodelivery.com.br", "");

  // Local dev: no subdomain available, use ?slug= query param
  if (!slug || slug === host || slug.includes(".") || host === "localhost") {
    const querySlug = request.nextUrl.searchParams.get("slug");
    if (querySlug) {
      const url = request.nextUrl.clone();
      url.pathname = `/${querySlug}`;
      url.searchParams.delete("slug");
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Rewrite subdomain to /[slug] route
  const url = request.nextUrl.clone();
  url.pathname = `/${slug}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|api).*)"],
};
