import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname === "/admin/login" ||
    pathname === "/api/login"
  ) {
    return NextResponse.next()
  }

  const routeProtegee =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/stock") ||
    pathname.startsWith("/api/produits") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/commandes") ||
    pathname.startsWith("/api/push")

  if (routeProtegee) {
    const session = request.cookies.get("admin_session")

    if (!session || session.value !== process.env.ADMIN_PASSWORD) {
      if (pathname.startsWith("/admin")) {
        const loginUrl = new URL("/admin/login", request.url)
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/stock/:path*", "/api/produits/:path*", "/api/upload/:path*", "/api/commandes/:path*", "/api/push/:path*"],
}
