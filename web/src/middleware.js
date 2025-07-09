import { NextResponse } from "next/server";

function middleware(request) {
  const token =
    request.cookies.get("authToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const { pathname } = request.nextUrl;

  // Define protected and auth routes
  const protectedRoutes = ["/app", "/account"];
  const authRoutes = ["/login", "/register", "/forgot", "/reset", "/confirm"];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.includes(pathname);

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  return NextResponse.next();
}

const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export { config, middleware };
