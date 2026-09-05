import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { statut } = await request.json()

    if (!statut) {
      return NextResponse.json(
        { success: false, message: "Statut requis" },
        { status: 400 }
      )
    }

    // Si on annule, on remet les produits en stock avant de changer le statut
    if (statut === "Annulée") {
      const { data: lignes, error: erreurLignes } = await supabaseAdmin
        .from("Lignes_Commande")
        .select("produit_id, quantite")
        .eq("commande_id", id)

      if (erreurLignes) {
        throw new Error(erreurLignes.message)
      }

      for (const ligne of lignes || []) {
        const { error: erreurStock } = await supabaseAdmin.rpc(
          "ajuster_stock",
          {
            produit_id_input: ligne.produit_id,
            delta: ligne.quantite,
          }
        )

        if (erreurStock) {
          console.log("ERREUR REMISE EN STOCK :", erreurStock)
        }
      }
    }

    const { error } = await supabaseAdmin
      .from("Commandes")
      .update({ statut })
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

    const { error: erreurLignes } = await supabaseAdmin
      .from("Lignes_Commande")
      .delete()
      .eq("commande_id", id)

    if (erreurLignes) {
      throw new Error(erreurLignes.message)
    }

    const { error: erreurCommande } = await supabaseAdmin
      .from("Commandes")
      .delete()
      .eq("id", id)

    if (erreurCommande) {
      throw new Error(erreurCommande.message)
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
