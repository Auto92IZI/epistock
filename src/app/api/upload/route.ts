import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const fichier = formData.get("fichier") as File | null

    if (!fichier) {
      return NextResponse.json(
        { success: false, message: "Aucun fichier reçu" },
        { status: 400 }
      )
    }

    const extension = fichier.name.split(".").pop()
    const nomFichier = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

    const arrayBuffer = await fichier.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: erreurUpload } = await supabaseAdmin.storage
      .from("products")
      .upload(nomFichier, buffer, {
        contentType: fichier.type,
        upsert: false,
      })

    if (erreurUpload) {
      throw new Error(erreurUpload.message)
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("products")
      .getPublicUrl(nomFichier)

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
    })
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
