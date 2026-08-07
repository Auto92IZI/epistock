import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: Request) {
  try {
    const { produitId, quantiteRecue } = await request.json()

    if (!produitId || !quantiteRecue || quantiteRecue <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantité invalide" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.rpc("ajuster_stock", {
      produit_id_input: produitId,
      delta: quantiteRecue,
    })

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
