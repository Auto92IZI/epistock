import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const STATUTS = ["En attente", "Prête", "Récupérée", "Annulée"]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const misAJour: { statut?: string; client_nom?: string; client_telephone?: string } = {}

    if (typeof body.statut === "string" && STATUTS.includes(body.statut)) {
      misAJour.statut = body.statut
    }
    if (typeof body.clientNom === "string" && body.clientNom.trim() !== "") {
      misAJour.client_nom = body.clientNom.trim()
    }
    if (typeof body.clientTelephone === "string" && body.clientTelephone.trim() !== "") {
      misAJour.client_telephone = body.clientTelephone.trim()
    }

    if (Object.keys(misAJour).length === 0) {
      return NextResponse.json({ success: false, message: "Rien à modifier" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("Commandes").update(misAJour).eq("id", id)
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

    const { error: erreurLignes } = await supabaseAdmin.from("Lignes_Commande").delete().eq("commande_id", id)
    if (erreurLignes) throw new Error(erreurLignes.message)

    const { error: erreurCommande } = await supabaseAdmin.from("Commandes").delete().eq("id", id)
    if (erreurCommande) throw new Error(erreurCommande.message)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
