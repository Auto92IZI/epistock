import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ligneId: string }> }
) {
  try {
    const { id, ligneId } = await params

    const { error: erreurDelete } = await supabaseAdmin
      .from("Lignes_Commande")
      .delete()
      .eq("id", ligneId)
      .eq("commande_id", id)

    if (erreurDelete) throw new Error(erreurDelete.message)

    const { data: restantes, error: erreurRestantes } = await supabaseAdmin
      .from("Lignes_Commande")
      .select("quantite, prix_unitaire")
      .eq("commande_id", id)

    if (erreurRestantes) throw new Error(erreurRestantes.message)

    const nouveauTotal =
      Math.round(
        (restantes || []).reduce((t: number, l: any) => t + l.quantite * l.prix_unitaire, 0) * 100
      ) / 100

    const { error: erreurTotal } = await supabaseAdmin
      .from("Commandes")
      .update({ total: nouveauTotal })
      .eq("id", id)

    if (erreurTotal) throw new Error(erreurTotal.message)

    return NextResponse.json({ success: true, nouveauTotal })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
