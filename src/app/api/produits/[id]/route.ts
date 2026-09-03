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
      image_url?: string
      nom?: string
      categorie?: string | null
      prix?: number
      code_barre?: string | null
      stock?: number
    } = {}

    if (typeof body.disponible === "boolean") {
      misAJour.disponible = body.disponible
    }

    if (typeof body.imageUrl === "string") {
      misAJour.image_url = body.imageUrl
    }

    if (typeof body.nom === "string" && body.nom.trim() !== "") {
      misAJour.nom = body.nom.trim()
    }

    if (body.categorie !== undefined) {
      misAJour.categorie = body.categorie || null
    }

    if (typeof body.prix === "number" && !isNaN(body.prix)) {
      misAJour.prix = body.prix
    }

    if (body.codeBarre !== undefined) {
      misAJour.code_barre = body.codeBarre || null
    }

    if (typeof body.stock === "number" && !isNaN(body.stock) && body.stock >= 0) {
      misAJour.stock = body.stock
    }

    const { error } = await supabaseAdmin
      .from("Produits")
      .update(misAJour)
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
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

    const { error } = await supabaseAdmin
      .from("Produits")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}
