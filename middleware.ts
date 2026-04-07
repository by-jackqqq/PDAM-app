// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value?.toLowerCase();
  const pathname = request.nextUrl.pathname;

  const isLoginPage = pathname.startsWith("/login");
  const isAdminPage = pathname.startsWith("/admin");
  const isCustomerPage = pathname.startsWith("/customer");
  const isProtectedPage = isAdminPage || isCustomerPage;

  // 1. Belum login → redirect ke login
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Sudah login, akses /login → redirect ke dashboard sesuai role
  if (token && isLoginPage) {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/customer", request.url),
    );
  }

  // 3. Admin mencoba akses /customer → tolak, kembalikan ke /admin
  if (token && role === "admin" && isCustomerPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // 4. Customer mencoba akses /admin → tolak, kembalikan ke /customer
  if (token && role === "customer" && isAdminPage) {
    return NextResponse.redirect(new URL("/customer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*", "/login"],
};
