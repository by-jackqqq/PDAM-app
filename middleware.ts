import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const pathname = request.nextUrl.pathname

  const isLoginPage = pathname.startsWith("/login")
  const isDashboardPage = pathname.startsWith("/dashboard")

  if (!token && isDashboardPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}