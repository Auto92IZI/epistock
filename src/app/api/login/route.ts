import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { motDePasse } = await request.json()

    if (!motDePasse || motDePasse !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: "Mot de passe incorrect" },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set("admin_session", process.env.ADMIN_PASSWORD as string, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}
