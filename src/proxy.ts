import { NextResponse, type NextRequest } from "next/server";

const STAFF_SESSION_COOKIE = "grf_staff_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(STAFF_SESSION_COOKIE)?.value);

  if (pathname.startsWith("/complaints") && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasSession) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/complaints/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/complaints/:path*"],
};
