import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionPayload } from "@/lib/session";

const PROTECTED_PREFIXES = ["/submissions", "/brackets", "/guide", "/admin"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) return NextResponse.next();

  const res = NextResponse.next();
  const session = await getIronSession<SessionPayload>(req, res, sessionOptions);

  if (!session.userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/submissions";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/submissions/:path*", "/brackets/:path*", "/guide/:path*", "/admin/:path*"],
};
