import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const misAJour: {
      disponible?: boolean
      prix?: number
      univers?: string
      gamme?: string
      format?: string
      nom?: string
    } = {}

    if (typeof body.disponible === "boolean") misAJour.disponible = body.disponible
    if (typeof body.prix === "number" && !isNaN(body.prix) && body.prix >= 0) misAJour.prix = body.prix
    if (typeof body.univers === "string" && body.univers.trim()) misAJour.univers = body.univers.trim()

    if (
      typeof body.gamme === "string" && typeof body.format === "string" &&
      body.gamme.trim() && body.format.trim()
    ) {
      misAJour.gamme = body.gamme.trim()
      misAJour.format = body.format.trim()
      misAJour.nom = `${body.gamme.trim()} - ${body.format.trim()}`
    }

    if (Object.keys(misAJour).length === 0) {
      return NextResponse.json({ success: false, message: "Rien à modifier" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("Produits").update(misAJour).eq("id", id)
    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin.from("Produits").delete().eq("id", id)

    if (error) {
      if (error.code === "23503") {
        return NextResponse.json(
          { success: false, message: "Ce produit figure dans des commandes existantes : masquez-le plutôt que de le supprimer." },
          { status: 409 }
        )
      }
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
