import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get("token")?.value

  // Check if the path requires authentication
  const isAuthPath = request.nextUrl.pathname.startsWith("/account") || request.nextUrl.pathname.startsWith("/checkout")

  // Check if the path is admin-only
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin")

  // If path requires authentication and no token is present, redirect to login
  // if ((isAuthPath || isAdminPath) && !token) {
  //   return NextResponse.redirect(
  //     new URL("/login?redirect=" + encodeURIComponent(request.nextUrl.pathname), request.url),
  //   )
  // }

  // // If token is present, verify it
  // if (token && (isAuthPath || isAdminPath)) {
  //   const verifiedToken = verifyToken(token)

  //   // If token is invalid, clear it and redirect to login
  //   if (!verifiedToken.success) {
  //     const response = NextResponse.redirect(
  //       new URL("/login?redirect=" + encodeURIComponent(request.nextUrl.pathname), request.url),
  //     )

  //     response.cookies.set("token", "", {
  //       httpOnly: true,
  //       expires: new Date(0),
  //     })

  //     return response
  //   }

  //   // If path is admin-only, check if user is admin
  //   if (isAdminPath && verifiedToken.role !== "admin") {
  //     return NextResponse.redirect(new URL("/", request.url))
  //   }
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
}

