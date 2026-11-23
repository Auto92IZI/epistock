import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function PATCH(request: Request) {
  try {
    const { univers, gamme, imageUrl } = await request.json()

    if (typeof univers !== "string" || typeof gamme !== "string" || !univers || !gamme) {
      return NextResponse.json({ success: false, message: "Produit inconnu" }, { status: 400 })
    }

    let url: string | null = null

    if (imageUrl) {
      const prefixe = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/`
      if (typeof imageUrl !== "string" || !imageUrl.startsWith(prefixe)) {
        return NextResponse.json({ success: false, message: "Adresse d'image invalide" }, { status: 400 })
      }
      url = imageUrl
    }

    const { error } = await supabaseAdmin
      .from("Produits")
      .update({ image_url: url })
      .eq("univers", univers)
      .eq("gamme", gamme)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
