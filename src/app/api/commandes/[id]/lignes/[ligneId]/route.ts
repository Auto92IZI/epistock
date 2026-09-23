import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ligneId: string }> }
) {
  try {
    const { id, ligneId } = await params

    const { data: ligne, error: erreurLigne } = await supabaseAdmin
      .from("Lignes_Commande")
      .select("produit_id, quantite")
      .eq("id", ligneId)
      .single()

    if (erreurLigne || !ligne) {
      throw new Error(erreurLigne?.message || "Ligne introuvable")
    }

    const { error: erreurDelete } = await supabaseAdmin
      .from("Lignes_Commande")
      .delete()
      .eq("id", ligneId)

    if (erreurDelete) {
      throw new Error(erreurDelete.message)
    }

    const { error: erreurStock } = await supabaseAdmin.rpc("ajuster_stock", {
      produit_id_input: ligne.produit_id,
      delta: ligne.quantite,
    })

    if (erreurStock) {
      console.log("ERREUR REMISE EN STOCK :", erreurStock)
    }

    const { data: lignesRestantes, error: erreurLignesRestantes } =
      await supabaseAdmin
        .from("Lignes_Commande")
        .select("quantite, prix_unitaire")
        .eq("commande_id", id)

    if (erreurLignesRestantes) {
      throw new Error(erreurLignesRestantes.message)
    }

    const nouveauTotal = (lignesRestantes || []).reduce(
      (total, l) => total + l.quantite * l.prix_unitaire,
      0
    )

    const { error: erreurMajTotal } = await supabaseAdmin
      .from("Commandes")
      .update({ total: nouveauTotal })
      .eq("id", id)

    if (erreurMajTotal) {
      throw new Error(erreurMajTotal.message)
    }

    return NextResponse.json({ success: true, nouveauTotal })
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
