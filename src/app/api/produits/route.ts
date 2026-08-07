import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: Request) {
  try {
    const { nom, categorie, prix, stock, imageUrl } = await request.json()

    if (!nom || prix === undefined || prix === null) {
      return NextResponse.json(
        { success: false, message: "Nom et prix requis" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("Produits")
      .insert({
        nom,
        categorie: categorie || null,
        prix,
        stock: stock || 0,
        disponible: true,
        image_url: imageUrl || null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true, produit: data })
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
