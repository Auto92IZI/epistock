import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}
const TAILLE_MAX = 4 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const fichier = formData.get("fichier")

    if (!(fichier instanceof File)) {
      return NextResponse.json({ success: false, message: "Aucun fichier reçu" }, { status: 400 })
    }

    const extension = TYPES[fichier.type]
    if (!extension) {
      return NextResponse.json(
        { success: false, message: "Format d'image non pris en charge (JPEG, PNG ou WebP)." },
        { status: 400 }
      )
    }

    if (fichier.size > TAILLE_MAX) {
      return NextResponse.json({ success: false, message: "Image trop volumineuse." }, { status: 413 })
    }

    const nomFichier = `produits/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
    const buffer = Buffer.from(await fichier.arrayBuffer())

    const { error: erreurUpload } = await supabaseAdmin.storage
      .from("products")
      .upload(nomFichier, buffer, {
        contentType: fichier.type,
        cacheControl: "31536000",
        upsert: false,
      })

    if (erreurUpload) throw new Error(erreurUpload.message)

    const { data: urlData } = supabaseAdmin.storage.from("products").getPublicUrl(nomFichier)

    return NextResponse.json({ success: true, imageUrl: urlData.publicUrl })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
