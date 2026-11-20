import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const univers = String(body.univers || "").trim()
    const gamme = String(body.gamme || "").trim()
    const format = String(body.format || "").trim()
    const prix = Number(body.prix)

    if (!univers || !gamme || !format || isNaN(prix) || prix <= 0) {
      return NextResponse.json(
        { success: false, message: "Univers, gamme, format et prix (supérieur à 0) requis" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("Produits")
      .insert({ nom: `${gamme} - ${format}`, univers, gamme, format, prix, stock: 0, disponible: true })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, produit: data })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
